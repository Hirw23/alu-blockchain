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
    const { interval = 'DAILY', startDate, endDate, businessId } = filters;

    const where = {};
    if (businessId) {
      where.productIdentity = { businessId };
    }
    if (startDate || endDate) {
      where.verifiedAt = {};
      if (startDate) where.verifiedAt.gte = new Date(startDate);
      if (endDate) where.verifiedAt.lte = new Date(endDate);
    }

    const events = await prisma.verificationEvent.findMany({
      where,
      select: { verifiedAt: true, verificationStatus: true },
    });

    const bucketKey = (date) => {
      const d = new Date(date);
      switch (interval) {
        case 'WEEKLY': {
          const weekStart = new Date(d);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          return weekStart.toISOString().slice(0, 10);
        }
        case 'MONTHLY':
          return d.toISOString().slice(0, 7);
        case 'QUARTERLY':
          return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
        case 'YEARLY':
          return String(d.getFullYear());
        default:
          return d.toISOString().slice(0, 10);
      }
    };

    const buckets = new Map();
    for (const event of events) {
      const key = `${bucketKey(event.verifiedAt)}|${event.verificationStatus}`;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    return Array.from(buckets.entries())
      .map(([key, scanCount]) => {
        const [date, status] = key.split('|');
        return { date, scanCount, status };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
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
