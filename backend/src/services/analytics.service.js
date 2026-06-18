import analyticsRepository from '../repositories/analytics.repository.js';
import prisma from '../database/client.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export const analyticsService = {
  // =========================================================================
  // DASHBOARD SERVICES
  // =========================================================================

  async getDashboard(userId, userRole, type) {
    const dashboardType =
      type ||
      (userRole === 'PlatformAdmin'
        ? 'ADMIN'
        : userRole === 'CooperativeAdmin'
          ? 'COOPERATIVE'
          : 'ENTREPRENEUR');

    if (dashboardType === 'ADMIN') {
      if (userRole !== 'PlatformAdmin') {
        throw new ForbiddenError('Only Platform Administrators can view global admin dashboards');
      }
      return analyticsRepository.getAdminDashboard();
    }

    if (dashboardType === 'COOPERATIVE') {
      return analyticsRepository.getCooperativeDashboard(userId);
    }

    return analyticsRepository.getEntrepreneurDashboard(userId);
  },

  // =========================================================================
  // KPI ENGINES
  // =========================================================================

  async getBusinessKPIs(businessId, userId, userRole) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { members: true },
    });

    if (!business) {
      throw new NotFoundError('Business not found');
    }

    // Verify management access
    if (userRole !== 'PlatformAdmin' && business.ownerId !== userId) {
      const membership = business.members.find((m) => m.userId === userId);
      if (!membership || !['Owner', 'Manager'].includes(membership.role)) {
        throw new ForbiddenError('You do not have permission to view this business KPIs');
      }
    }

    const totalProducts = await prisma.product.count({ where: { businessId } });
    const activeProducts = await prisma.product.count({
      where: { businessId, status: 'ACTIVE' },
    });

    const qrScanCount = await prisma.verificationEvent.count({
      where: { productIdentity: { businessId } },
    });

    const successScans = await prisma.verificationEvent.count({
      where: {
        productIdentity: { businessId },
        verificationStatus: 'SUCCESS',
      },
    });

    const verificationRate = qrScanCount > 0 ? (successScans / qrScanCount) * 100 : 0;

    return {
      productsRegistered: totalProducts,
      activeProducts,
      qrScanCount,
      verificationRate,
    };
  },

  async getProductKPIs(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const verificationCount = await prisma.verificationEvent.count({
      where: { productIdentity: { productId } },
    });

    const timelines = await prisma.supplyChainEvent.findMany({
      where: { productId },
      orderBy: { sequenceNumber: 'desc' },
      take: 1,
      include: { eventType: true },
    });

    const currentStage = timelines.length > 0 ? timelines[0].eventType.name : 'Harvested';

    return {
      productId,
      productName: product.productName,
      verificationCount,
      currentStage,
    };
  },

  // =========================================================================
  // GEOGRAPHIC & TREND ANALYTICS
  // =========================================================================

  async getGeographicStats() {
    return analyticsRepository.getGeographicStats();
  },

  async getTrends(filters = {}) {
    const interval = filters.interval || 'DAILY';
    console.log('Trends interval request:', interval);
    // Group verifications count by date interval buckets
    // In standard mockup/simplified terms, return time-series mapping
    return [
      { date: '2026-07-08', scanCount: 15, status: 'SUCCESS' },
      { date: '2026-07-09', scanCount: 22, status: 'SUCCESS' },
      { date: '2026-07-10', scanCount: 30, status: 'SUCCESS' },
    ];
  },

  // =========================================================================
  // COMPARATIVE ANALYTICS
  // =========================================================================

  async compareProducts(productIds) {
    const comparisonMetrics = [];

    for (const id of productIds) {
      try {
        const kpi = await this.getProductKPIs(id);
        comparisonMetrics.push(kpi);
      } catch (err) {
        console.error('Comparison skip:', err.message);
      }
    }

    return comparisonMetrics;
  },
};

export default analyticsService;
