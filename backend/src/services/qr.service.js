import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import qrRepository from '../repositories/qr.repository.js';
import productsService from './products.service.js';
import supplychainService from './supplychain.service.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';

const hashIp = (ip) =>
  crypto
    .createHash('sha256')
    .update(ip || '')
    .digest('hex');

const checkIdentityAccess = (business, userId, userRole) => {
  if (userRole === 'PlatformAdmin') return;
  if (business.ownerId === userId) return;

  const membership = business.members.find((m) => m.userId === userId);
  if (!membership || !['Owner', 'Manager'].includes(membership.role)) {
    throw new ForbiddenError(
      'You do not have permission to manage QR identities for this business'
    );
  }
};

export const qrService = {
  // =========================================================================
  // LIFECYCLE MANAGEMENT
  // =========================================================================

  async createIdentity(productId, userId, userRole, data = {}) {
    const product = await productsService.getProduct(productId);
    const business = product.business;

    // Permissions
    checkIdentityAccess(business, userId, userRole);

    // Verified business with active product check
    if (business.status !== 'ACTIVE' || business.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenError('Only active, verified businesses can generate digital identities');
    }
    if (product.status !== 'ACTIVE') {
      throw new BadRequestError('Only active products can generate digital identities');
    }

    const token = uuidv4();
    return qrRepository.createIdentity(productId, business.id, userId, token, data.expiresAt);
  },

  async updateStatus(identityId, userId, userRole, status) {
    const identity = await qrRepository.findById(identityId);
    if (!identity) {
      throw new NotFoundError('Identity not found');
    }

    checkIdentityAccess(identity.product.business, userId, userRole);

    const updateData = {};
    if (status === 'ACTIVE' || status === 'ACTIVATED') {
      updateData.activatedAt = new Date();
    } else if (status === 'REVOKED') {
      updateData.revokedAt = new Date();
    }

    return qrRepository.updateStatus(identityId, status, updateData);
  },

  async getIdentity(id) {
    const identity = await qrRepository.findById(id);
    if (!identity) {
      throw new NotFoundError('Identity not found');
    }
    return identity;
  },

  // Resolves the current identity for a product id — this is what every /products/:id/identity
  // and /products/:id/qr* route actually has available (the URL carries the product's id, never
  // the identity's own primary key). Controllers call this first, then delegate to the
  // identity-keyed methods below (getIdentity/updateStatus/generateQr/etc.) with the resolved
  // identity.id, matching how bulkGenerate already correctly chains createIdentity -> generateQr.
  async getIdentityByProductId(productId) {
    const identity = await qrRepository.findByProductId(productId);
    if (!identity) {
      throw new NotFoundError('No digital identity has been generated for this product yet');
    }
    return identity;
  },

  async deleteIdentity(id, userId, userRole) {
    const identity = await this.getIdentity(id);
    checkIdentityAccess(identity.product.business, userId, userRole);
    return qrRepository.deleteIdentity(id);
  },

  async search(filters) {
    return qrRepository.searchIdentities(filters);
  },

  // =========================================================================
  // QR GENERATION ENGINE
  // =========================================================================

  async generateQr(identityId, userId, userRole, config = {}) {
    const identity = await this.getIdentity(identityId);
    checkIdentityAccess(identity.product.business, userId, userRole);

    const format = config.format || 'PNG';
    const size = config.imageSize || 300;

    // Use FRONTEND_URL environment configuration to bind scan routing path
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify/${identity.verificationToken}`;

    const uploadsDir = path.resolve('uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filename = `qr-${identity.id}.${format.toLowerCase()}`;
    const filePath = path.join(uploadsDir, filename);

    if (format === 'PNG') {
      await QRCode.toFile(filePath, verifyUrl, { width: size });
    } else if (format === 'SVG') {
      const svgString = await QRCode.toString(verifyUrl, { type: 'svg', width: size });
      fs.writeFileSync(filePath, svgString);
    } else {
      // Mock printable PDF sheet
      fs.writeFileSync(filePath, `PDF-Verification-Sheet:${verifyUrl}`);
    }

    const stats = fs.statSync(filePath);

    // Save asset metadata
    const asset = await qrRepository.createAsset(identity.id, {
      imagePath: filePath,
      imageFormat: format,
      imageSize: stats.size,
    });

    // Transit identity state automatically to PRINTED
    await qrRepository.updateStatus(identity.id, 'PRINTED');

    return asset;
  },

  async previewQr(identityId, userId, userRole, format = 'PNG') {
    const identity = await this.getIdentity(identityId);
    checkIdentityAccess(identity.product.business, userId, userRole);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify/${identity.verificationToken}`;

    if (format === 'SVG') {
      return QRCode.toString(verifyUrl, { type: 'svg' });
    }

    return QRCode.toBuffer(verifyUrl);
  },

  async bulkGenerate(userId, userRole, data) {
    const assets = [];
    for (const productId of data.productIds) {
      try {
        const identity = await this.createIdentity(productId, userId, userRole);
        const asset = await this.generateQr(identity.id, userId, userRole, {
          format: data.format,
        });
        assets.push(asset);
      } catch (err) {
        console.error('Bulk generation skip:', err.message);
      }
    }
    return assets;
  },

  // =========================================================================
  // PUBLIC VERIFICATION SERVICE
  // =========================================================================

  async verifyToken(token, clientIp, metadata = {}) {
    const identity = await qrRepository.findByToken(token);
    const hashedIp = hashIp(clientIp);

    if (!identity) {
      // Create a failed log
      return {
        verificationStatus: 'FAILED',
        authenticity: 'UNVERIFIED',
        verificationMessage: 'Invalid verification token provided.',
      };
    }

    let status = 'SUCCESS';
    let authenticity = 'VERIFIED';
    let message = 'This product is authentic and verified.';

    // Enforce Lifecycle status locks
    if (identity.qrStatus !== 'ACTIVE') {
      status = 'FAILED';
      authenticity = 'UNVERIFIED';
      if (identity.qrStatus === 'REVOKED') {
        message = 'This QR verification token has been revoked by the manufacturer.';
      } else if (identity.qrStatus === 'EXPIRED') {
        message = 'This verification token has expired.';
      } else {
        message = `This token is inactive (Current state: ${identity.qrStatus}).`;
      }
    }

    if (identity.expiresAt && new Date() > new Date(identity.expiresAt)) {
      status = 'FAILED';
      authenticity = 'UNVERIFIED';
      message = 'This verification token has expired.';
      await qrRepository.updateStatus(identity.id, 'EXPIRED');
    }

    // Save verification scans event logs
    await qrRepository.createEvent(identity.id, {
      verificationStatus: status,
      ipHash: hashedIp,
      userAgent: metadata.userAgent,
      deviceType: metadata.deviceType,
      browser: metadata.browser,
      operatingSystem: metadata.operatingSystem,
      country: metadata.country || 'Rwanda',
    });

    if (status === 'SUCCESS') {
      await qrRepository.incrementScanCount(identity.id);
    }

    // Get current supply chain stage and timeline logs
    const currentStage = await supplychainService.getCurrentStage(identity.productId);
    const timeline = await supplychainService.getTimeline(identity.productId);

    const recordedEvent = timeline.find((evt) =>
      ['RECORDED', 'CONFIRMED'].includes(evt.blockchainStatus)
    );

    return {
      verificationStatus: status,
      authenticity,
      productName: identity.product.productName,
      businessName: identity.product.business.businessName,
      categoryName: identity.product.category.categoryName,
      countryOfOrigin: identity.product.countryOfOrigin,
      currentSupplyChainStage: currentStage.stage,
      blockchainVerified: recordedEvent ? true : false,
      blockchainTransactionId: recordedEvent?.blockchainTransactionId || null,
      blockchainTimestamp: recordedEvent?.blockchainRecordedAt || null,
      verificationMessage: message,
      timeline: timeline.map((evt) => ({
        stage: evt.eventType.name,
        occurredAt: evt.occurredAt,
        title: evt.title,
        description: evt.description,
        blockchainStatus: evt.blockchainStatus,
        blockchainTransactionId: evt.blockchainTransactionId,
        blockchainRecordedAt: evt.blockchainRecordedAt,
      })),
    };
  },

  // =========================================================================
  // SCAN STATISTICS
  // =========================================================================

  async getProductStatistics(productId) {
    return qrRepository.getStatistics(productId);
  },

  async getBusinessStatistics(businessId) {
    return qrRepository.getBusinessStatistics(businessId);
  },

  async getLatestScan(productId) {
    return qrRepository.getLatestEvent(productId);
  },

  async getVerificationHistory(productId, page = 1, limit = 10) {
    return qrRepository.searchEvents(productId, page, limit);
  },

  // =========================================================================
  // ASSETS DOWNLOAD & ACTIONS
  // =========================================================================

  async getAssets(identityId) {
    return qrRepository.getAssets(identityId);
  },

  async deleteAsset(identityId, assetId, userId, userRole) {
    const identity = await this.getIdentity(identityId);
    checkIdentityAccess(identity.product.business, userId, userRole);

    const asset = await qrRepository.findAssetById(assetId);
    if (!asset || asset.productIdentityId !== identityId) {
      throw new NotFoundError('Asset not found');
    }

    if (fs.existsSync(asset.imagePath)) {
      fs.unlinkSync(asset.imagePath);
    }

    return qrRepository.deleteAsset(assetId);
  },
};

export default qrService;
