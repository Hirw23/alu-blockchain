import { jest } from '@jest/globals';

// ============================================================
// Unit tests for qrService business logic
// Tests identity creation, status updates, and verification
// ============================================================

const mockQrRepo = {
  createIdentity: jest.fn(),
  findById: jest.fn(),
  findByToken: jest.fn(),
  findActiveByProductId: jest.fn(),
  updateStatus: jest.fn(),
  incrementScanCount: jest.fn(),
  deleteIdentity: jest.fn(),
  searchIdentities: jest.fn(),
  createAsset: jest.fn(),
  findAssetById: jest.fn(),
  getAssets: jest.fn(),
  deleteAsset: jest.fn(),
  incrementDownloads: jest.fn(),
  incrementPrints: jest.fn(),
  createEvent: jest.fn(),         // used by verifyToken to log scan events
  searchEvents: jest.fn(),
  getLatestEvent: jest.fn(),
  getStatistics: jest.fn(),
  getBusinessStatistics: jest.fn(),
};

const mockProductsService = {
  getProduct: jest.fn(),
};

const mockSupplychainService = {
  getCurrentStage: jest.fn(),
  getTimeline: jest.fn(),
};

jest.unstable_mockModule('../repositories/qr.repository.js', () => ({
  default: mockQrRepo,
  qrRepository: mockQrRepo,
}));

jest.unstable_mockModule('../services/products.service.js', () => ({
  default: mockProductsService,
  productsService: mockProductsService,
}));

jest.unstable_mockModule('../services/supplychain.service.js', () => ({
  default: mockSupplychainService,
  supplychainService: mockSupplychainService,
}));

// qr.service.js exports `qrService`
const { qrService } = await import('../services/qr.service.js');

const activeProduct = {
  id: 'prod-1',
  productName: 'Fine Arabica Coffee',
  status: 'ACTIVE',
  countryOfOrigin: 'Rwanda',
  category: { categoryName: 'Coffee' },
  business: {
    id: 'bus-1',
    ownerId: 'usr-1',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    members: [],
  },
};

describe('QrService — Unit Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Safe defaults so verifyToken's downstream calls don't hang
    mockSupplychainService.getCurrentStage.mockResolvedValue({ stage: 'Pending', category: 'Production', lastUpdated: null });
    mockSupplychainService.getTimeline.mockResolvedValue([]);
    mockQrRepo.createEvent.mockResolvedValue({ id: 'scan-evt' });
    mockQrRepo.incrementScanCount.mockResolvedValue({});
  });

  describe('createIdentity()', () => {
    it('should throw BadRequestError when product is not ACTIVE', async () => {
      mockProductsService.getProduct.mockResolvedValue({
        ...activeProduct,
        status: 'DRAFT',
      });

      await expect(
        qrService.createIdentity('prod-1', 'usr-1', 'Entrepreneur', {})
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw ForbiddenError when user does not belong to the business', async () => {
      mockProductsService.getProduct.mockResolvedValue(activeProduct);

      await expect(
        qrService.createIdentity('prod-1', 'usr-outsider', 'Entrepreneur', {})
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should create and return a new identity for the business owner', async () => {
      mockProductsService.getProduct.mockResolvedValue(activeProduct);
      mockQrRepo.createIdentity.mockResolvedValue({
        id: 'ident-1',
        productId: 'prod-1',
        qrStatus: 'GENERATED',
        verificationToken: 'tok-abc',
      });

      const result = await qrService.createIdentity('prod-1', 'usr-1', 'Entrepreneur', {});
      expect(mockQrRepo.createIdentity).toHaveBeenCalledTimes(1);
      expect(result.qrStatus).toBe('GENERATED');
    });
  });

  describe('updateStatus() — revoke path', () => {
    it('should throw NotFoundError when identity does not exist', async () => {
      mockQrRepo.findById.mockResolvedValue(null);
      // updateStatus(identityId, userId, userRole, status)
      await expect(
        qrService.updateStatus('no-id', 'usr-1', 'Entrepreneur', 'REVOKED')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should call updateStatus repo with REVOKED and set revokedAt timestamp', async () => {
      mockQrRepo.findById.mockResolvedValue({
        id: 'ident-1',
        productId: 'prod-1',
        qrStatus: 'ACTIVE',
        product: activeProduct,
      });
      mockQrRepo.updateStatus.mockResolvedValue({ id: 'ident-1', qrStatus: 'REVOKED' });

      const result = await qrService.updateStatus('ident-1', 'usr-1', 'Entrepreneur', 'REVOKED');

      expect(mockQrRepo.updateStatus).toHaveBeenCalledWith(
        'ident-1',
        'REVOKED',
        expect.objectContaining({ revokedAt: expect.any(Date) })
      );
      expect(result.qrStatus).toBe('REVOKED');
    });

    it('should set activatedAt when status is ACTIVE', async () => {
      mockQrRepo.findById.mockResolvedValue({
        id: 'ident-1',
        qrStatus: 'GENERATED',
        product: activeProduct,
      });
      mockQrRepo.updateStatus.mockResolvedValue({ id: 'ident-1', qrStatus: 'ACTIVE' });

      await qrService.updateStatus('ident-1', 'usr-1', 'Entrepreneur', 'ACTIVE');

      expect(mockQrRepo.updateStatus).toHaveBeenCalledWith(
        'ident-1',
        'ACTIVE',
        expect.objectContaining({ activatedAt: expect.any(Date) })
      );
    });
  });

  describe('verifyToken()', () => {
    it('should return FAILED result for unknown verification token', async () => {
      mockQrRepo.findByToken.mockResolvedValue(null);
      // verifyToken(token, clientIp, metadata)
      const result = await qrService.verifyToken('unknown-token', '127.0.0.1', {});
      expect(result.verificationStatus).toBe('FAILED');
      expect(result.authenticity).toBe('UNVERIFIED');
    });

    it('should return FAILED result for REVOKED identity and log the scan event', async () => {
      mockQrRepo.findByToken.mockResolvedValue({
        id: 'ident-1',
        productId: 'prod-1',
        verificationToken: 'tok-1',
        qrStatus: 'REVOKED',
        product: {
          ...activeProduct,
          businessName: 'Rwandan Coffee Coop',
          business: { ...activeProduct.business, businessName: 'Rwandan Coffee Coop' },
        },
      });

      const result = await qrService.verifyToken('tok-1', '127.0.0.1', {});
      expect(result.verificationStatus).toBe('FAILED');
      expect(result.verificationMessage).toContain('revoked');
      expect(mockQrRepo.createEvent).toHaveBeenCalledTimes(1);
    });

    it('should return SUCCESS result for ACTIVE identity and log the scan event', async () => {
      mockQrRepo.findByToken.mockResolvedValue({
        id: 'ident-1',
        productId: 'prod-1',
        verificationToken: 'tok-active',
        qrStatus: 'ACTIVE',
        product: {
          ...activeProduct,
          businessName: 'Rwandan Coffee Coop',
          business: { ...activeProduct.business, businessName: 'Rwandan Coffee Coop' },
        },
      });

      const result = await qrService.verifyToken('tok-active', '127.0.0.1', {});
      expect(result.verificationStatus).toBe('SUCCESS');
      expect(result.authenticity).toBe('VERIFIED');
      expect(mockQrRepo.createEvent).toHaveBeenCalledTimes(1);
      expect(mockQrRepo.incrementScanCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('getIdentity()', () => {
    it('should throw NotFoundError for unknown identity ID', async () => {
      mockQrRepo.findById.mockResolvedValue(null);
      await expect(qrService.getIdentity('no-id')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should return identity data when found', async () => {
      const identity = { id: 'ident-1', qrStatus: 'ACTIVE' };
      mockQrRepo.findById.mockResolvedValue(identity);
      const result = await qrService.getIdentity('ident-1');
      expect(result.qrStatus).toBe('ACTIVE');
    });
  });
});
