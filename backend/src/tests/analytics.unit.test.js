import { jest } from '@jest/globals';

// ============================================================
// Unit tests for analyticsService business logic
// Tests dashboard gating, KPI access control, and trend data
// ============================================================

const mockAnalyticsRepo = {
  getAdminDashboard: jest.fn(),
  getEntrepreneurDashboard: jest.fn(),
  getCooperativeDashboard: jest.fn(),
  getGeographicStats: jest.fn(),
};

const mockPrisma = {
  business: { findUnique: jest.fn() },
  product: { findUnique: jest.fn(), count: jest.fn() },
  verificationEvent: { count: jest.fn(), findMany: jest.fn() },
  supplyChainEvent: { findMany: jest.fn() },
};

jest.unstable_mockModule('../repositories/analytics.repository.js', () => ({
  default: mockAnalyticsRepo,
  analyticsRepository: mockAnalyticsRepo,
}));

jest.unstable_mockModule('../database/client.js', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

const { analyticsService } = await import('../services/analytics.service.js');

describe('AnalyticsService — Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getDashboard()', () => {
    it('should throw ForbiddenError when Entrepreneur requests ADMIN dashboard', async () => {
      await expect(
        analyticsService.getDashboard('usr-1', 'Entrepreneur', 'ADMIN')
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should call getAdminDashboard for PlatformAdmin with ADMIN type', async () => {
      mockAnalyticsRepo.getAdminDashboard.mockResolvedValue({ totalUsers: 100 });
      const result = await analyticsService.getDashboard('usr-admin', 'PlatformAdmin', 'ADMIN');
      expect(mockAnalyticsRepo.getAdminDashboard).toHaveBeenCalledTimes(1);
      expect(result.totalUsers).toBe(100);
    });

    it('should call getEntrepreneurDashboard when no type is provided for Entrepreneur', async () => {
      mockAnalyticsRepo.getEntrepreneurDashboard.mockResolvedValue({ totalProducts: 5 });
      await analyticsService.getDashboard('usr-1', 'Entrepreneur');
      expect(mockAnalyticsRepo.getEntrepreneurDashboard).toHaveBeenCalledWith('usr-1');
    });

    it('should call getCooperativeDashboard for CooperativeAdmin', async () => {
      mockAnalyticsRepo.getCooperativeDashboard.mockResolvedValue({ members: 10 });
      await analyticsService.getDashboard('usr-coop', 'CooperativeAdmin');
      expect(mockAnalyticsRepo.getCooperativeDashboard).toHaveBeenCalledWith('usr-coop');
    });
  });

  describe('getBusinessKPIs()', () => {
    it('should throw NotFoundError for unknown business', async () => {
      mockPrisma.business.findUnique.mockResolvedValue(null);
      await expect(
        analyticsService.getBusinessKPIs('no-id', 'usr-1', 'Entrepreneur')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw ForbiddenError when non-owner/non-member requests KPIs', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'bus-1',
        ownerId: 'usr-owner',
        members: [],
      });

      await expect(
        analyticsService.getBusinessKPIs('bus-1', 'usr-outsider', 'Entrepreneur')
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should return KPI data for the business owner', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'bus-1',
        ownerId: 'usr-1',
        members: [],
      });
      mockPrisma.product.count
        .mockResolvedValueOnce(10)  // totalProducts
        .mockResolvedValueOnce(7);  // activeProducts
      mockPrisma.verificationEvent.count
        .mockResolvedValueOnce(50) // qrScanCount
        .mockResolvedValueOnce(45); // successScans

      const result = await analyticsService.getBusinessKPIs('bus-1', 'usr-1', 'Entrepreneur');
      expect(result.productsRegistered).toBe(10);
      expect(result.activeProducts).toBe(7);
      expect(result.verificationRate).toBe(90);
    });
  });

  describe('getTrends()', () => {
    it('should return trend data with default DAILY interval', async () => {
      mockPrisma.verificationEvent.findMany.mockResolvedValue([
        { verifiedAt: new Date('2026-07-08T10:00:00Z'), verificationStatus: 'SUCCESS' },
        { verifiedAt: new Date('2026-07-08T14:00:00Z'), verificationStatus: 'SUCCESS' },
        { verifiedAt: new Date('2026-07-09T09:00:00Z'), verificationStatus: 'FAILED' },
      ]);

      const result = await analyticsService.getTrends();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('scanCount');
      const dayOne = result.find((r) => r.date === '2026-07-08' && r.status === 'SUCCESS');
      expect(dayOne.scanCount).toBe(2);
    });

    it('should return trend data when a specific interval is provided', async () => {
      mockPrisma.verificationEvent.findMany.mockResolvedValue([
        { verifiedAt: new Date('2026-07-08T10:00:00Z'), verificationStatus: 'SUCCESS' },
      ]);

      const result = await analyticsService.getTrends({ interval: 'MONTHLY' });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].date).toBe('2026-07');
    });
  });

  describe('getGeographicStats()', () => {
    it('should delegate to analyticsRepository', async () => {
      mockAnalyticsRepo.getGeographicStats.mockResolvedValue([{ country: 'Rwanda', count: 20 }]);
      const result = await analyticsService.getGeographicStats();
      expect(mockAnalyticsRepo.getGeographicStats).toHaveBeenCalledTimes(1);
      expect(result[0].country).toBe('Rwanda');
    });
  });
});
