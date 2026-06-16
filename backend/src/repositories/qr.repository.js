import prisma from '../database/client.js';

export const qrRepository = {
  // =========================================================================
  // PRODUCT IDENTITY
  // =========================================================================

  async createIdentity(productId, businessId, generatedBy, verificationToken, expiresAt) {
    return prisma.$transaction(async (tx) => {
      // Archive any currently active identities for this product as per version rules
      await tx.productIdentity.updateMany({
        where: { productId, qrStatus: 'ACTIVE' },
        data: { qrStatus: 'ARCHIVED' },
      });

      // Find highest version number to increment qrVersion
      const agg = await tx.productIdentity.aggregate({
        where: { productId },
        _max: { qrVersion: true },
      });
      const nextVersion = (agg._max.qrVersion || 0) + 1;

      return tx.productIdentity.create({
        data: {
          productId,
          businessId,
          generatedBy,
          verificationToken,
          qrVersion: nextVersion,
          qrStatus: 'GENERATED',
          expiresAt,
        },
        include: {
          product: true,
        },
      });
    });
  },

  async findById(id) {
    return prisma.productIdentity.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            business: true,
          },
        },
        qrCodeAssets: true,
      },
    });
  },

  async findByToken(verificationToken) {
    return prisma.productIdentity.findUnique({
      where: { verificationToken },
      include: {
        product: {
          include: {
            business: true,
            category: true,
          },
        },
      },
    });
  },

  async findActiveByProductId(productId) {
    return prisma.productIdentity.findFirst({
      where: { productId, qrStatus: 'ACTIVE' },
      include: {
        qrCodeAssets: true,
      },
    });
  },

  async updateStatus(id, qrStatus, extraData = {}) {
    return prisma.productIdentity.update({
      where: { id },
      data: {
        qrStatus,
        ...extraData,
      },
    });
  },

  async incrementScanCount(id) {
    return prisma.productIdentity.update({
      where: { id },
      data: {
        totalScans: { increment: 1 },
        lastScanAt: new Date(),
      },
    });
  },

  async deleteIdentity(id) {
    return prisma.productIdentity.delete({
      where: { id },
    });
  },

  async searchIdentities(filters) {
    const { productId, qrStatus, page, limit, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;
    const where = {};

    if (productId) where.productId = productId;
    if (qrStatus) where.qrStatus = qrStatus;

    const [items, total] = await prisma.$transaction([
      prisma.productIdentity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { qrCodeAssets: true },
      }),
      prisma.productIdentity.count({ where }),
    ]);

    return { items, total };
  },

  // =========================================================================
  // QR ASSETS
  // =========================================================================

  async createAsset(productIdentityId, data) {
    return prisma.qRCodeAsset.create({
      data: {
        productIdentityId,
        ...data,
      },
    });
  },

  async findAssetById(id) {
    return prisma.qRCodeAsset.findUnique({
      where: { id },
    });
  },

  async getAssets(productIdentityId) {
    return prisma.qRCodeAsset.findMany({
      where: { productIdentityId },
    });
  },

  async deleteAsset(id) {
    return prisma.qRCodeAsset.delete({
      where: { id },
    });
  },

  async incrementDownloads(id) {
    return prisma.qRCodeAsset.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  },

  async incrementPrints(id) {
    return prisma.qRCodeAsset.update({
      where: { id },
      data: { printCount: { increment: 1 } },
    });
  },

  // =========================================================================
  // VERIFICATION EVENTS
  // =========================================================================

  async createEvent(productIdentityId, data) {
    return prisma.verificationEvent.create({
      data: {
        productIdentityId,
        ...data,
      },
    });
  },

  async searchEvents(productId, page, limit) {
    const skip = (page - 1) * limit;
    const where = {
      productIdentity: {
        productId,
      },
    };

    const [items, total] = await prisma.$transaction([
      prisma.verificationEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { verifiedAt: 'desc' },
      }),
      prisma.verificationEvent.count({ where }),
    ]);

    return { items, total };
  },

  async getLatestEvent(productId) {
    return prisma.verificationEvent.findFirst({
      where: {
        productIdentity: {
          productId,
        },
      },
      orderBy: { verifiedAt: 'desc' },
    });
  },

  async getStatistics(productId) {
    const where = {
      productIdentity: {
        productId,
      },
    };

    const totalScans = await prisma.verificationEvent.count({ where });
    const successScans = await prisma.verificationEvent.count({
      where: {
        ...where,
        verificationStatus: 'SUCCESS',
      },
    });

    const failedScans = totalScans - successScans;

    return {
      totalScans,
      successScans,
      failedScans,
    };
  },

  async getBusinessStatistics(businessId) {
    const identities = await prisma.productIdentity.findMany({
      where: { businessId },
      select: { id: true },
    });
    const identityIds = identities.map((id) => id.id);

    const totalIdentities = identityIds.length;
    const totalScans = await prisma.verificationEvent.count({
      where: {
        productIdentityId: { in: identityIds },
      },
    });

    return {
      totalIdentities,
      totalScans,
    };
  },
};

export default qrRepository;
