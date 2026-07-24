import prisma from '../database/client.js';

export const analyticsRepository = {
  // =========================================================================
  // REPORT DEFINITIONS
  // =========================================================================

  async createDefinition(createdBy, data) {
    return prisma.reportDefinition.create({
      data: {
        name: data.name,
        reportType: data.reportType,
        createdBy,
        filters: JSON.stringify(data.filters || {}),
      },
    });
  },

  async findDefinitionById(id) {
    return prisma.reportDefinition.findUnique({
      where: { id },
    });
  },

  async getDefinitions(createdBy) {
    return prisma.reportDefinition.findMany({
      where: { createdBy },
    });
  },

  async deleteDefinition(id) {
    return prisma.reportDefinition.delete({
      where: { id },
    });
  },

  // =========================================================================
  // GENERATED EXPORT LOGS
  // =========================================================================

  async createGeneratedReport(reportDefinitionId, generatedBy, format, filePath) {
    return prisma.generatedReport.create({
      data: {
        reportDefinitionId,
        generatedBy,
        format,
        filePath,
      },
    });
  },

  async getGeneratedReports(reportDefinitionId) {
    return prisma.generatedReport.findMany({
      where: { reportDefinitionId },
    });
  },

  // =========================================================================
  // SCHEDULED REPORT SCHEMAS
  // =========================================================================

  async createSchedule(reportDefinitionId, data) {
    return prisma.reportSchedule.create({
      data: {
        reportDefinitionId,
        frequency: data.frequency,
        recipient: data.recipient,
        format: data.format,
      },
    });
  },

  async getSchedules() {
    return prisma.reportSchedule.findMany({
      include: {
        reportDefinition: true,
      },
    });
  },

  async deleteSchedule(id) {
    return prisma.reportSchedule.delete({
      where: { id },
    });
  },

  async updateSchedule(id, data) {
    return prisma.reportSchedule.update({
      where: { id },
      data,
    });
  },

  // =========================================================================
  // METRICS & AGGREGATIONS
  // =========================================================================

  async getEntrepreneurDashboard(userId) {
    // Find businesses owned by this entrepreneur user
    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const businessIds = businesses.map((b) => b.id);

    const totalBusinesses = businessIds.length;

    const totalProducts = await prisma.product.count({
      where: { businessId: { in: businessIds } },
    });

    const activeProducts = await prisma.product.count({
      where: { businessId: { in: businessIds }, status: 'ACTIVE' },
    });

    const qrCodesGenerated = await prisma.productIdentity.count({
      where: { businessId: { in: businessIds } },
    });

    const qrScans = await prisma.verificationEvent.count({
      where: { productIdentity: { businessId: { in: businessIds } } },
    });

    const supplyChainEvents = await prisma.supplyChainEvent.count({
      where: { product: { businessId: { in: businessIds } } },
    });

    const successScans = await prisma.verificationEvent.count({
      where: {
        productIdentity: { businessId: { in: businessIds } },
        verificationStatus: 'SUCCESS',
      },
    });

    const verificationRate = qrScans > 0 ? (successScans / qrScans) * 100 : 0;

    return {
      totalBusinesses,
      totalProducts,
      activeProducts,
      qrCodesGenerated,
      qrScans,
      supplyChainEvents,
      verificationRate,
    };
  },

  async getCooperativeDashboard(userId) {
    // Resolve cooperative where the user's business is enrolled
    const ownBusiness = await prisma.business.findFirst({
      where: { ownerId: userId },
      select: { cooperativeId: true },
    });

    const cooperativeId = ownBusiness?.cooperativeId;
    if (!cooperativeId) {
      return {
        totalMemberBusinesses: 0,
        activeBusinesses: 0,
        productsRegistered: 0,
        qrVerifications: 0,
        cooperativeName: 'No Cooperative Assigned',
      };
    }

    const cooperative = await prisma.cooperative.findUnique({
      where: { id: cooperativeId },
      select: { cooperativeName: true },
    });

    const totalMemberBusinesses = await prisma.business.count({
      where: { cooperativeId },
    });

    const activeBusinesses = await prisma.business.count({
      where: { cooperativeId, status: 'ACTIVE' },
    });

    const productsRegistered = await prisma.product.count({
      where: { business: { cooperativeId } },
    });

    const qrVerifications = await prisma.verificationEvent.count({
      where: { productIdentity: { product: { business: { cooperativeId } } } },
    });

    return {
      cooperativeName: cooperative?.cooperativeName || 'Standard Cooperative',
      totalMemberBusinesses,
      activeBusinesses,
      productsRegistered,
      qrVerifications,
    };
  },

  async getAdminDashboard() {
    const totalUsers = await prisma.user.count();
    const totalBusinesses = await prisma.business.count();
    const totalProducts = await prisma.product.count();
    const totalSupplyChainEvents = await prisma.supplyChainEvent.count();
    const totalQRIdentities = await prisma.productIdentity.count();
    const totalVerifications = await prisma.verificationEvent.count();

    const failedVerifications = await prisma.verificationEvent.count({
      where: { verificationStatus: 'FAILED' },
    });

    const recordedBlockchain = await prisma.supplyChainEvent.count({
      where: { blockchainStatus: { in: ['RECORDED', 'CONFIRMED'] } },
    });
    const failedBlockchain = await prisma.supplyChainEvent.count({
      where: { blockchainStatus: 'FAILED' },
    });
    const pendingBlockchain = await prisma.supplyChainEvent.count({
      where: { blockchainStatus: { in: ['PENDING', 'PROCESSING'] } },
    });

    return {
      totalUsers,
      totalBusinesses,
      totalProducts,
      totalSupplyChainEvents,
      totalQRIdentities,
      totalVerifications,
      failedVerifications,
      blockchainMetrics: {
        totalBlockchainRecords: totalSupplyChainEvents,
        successfulRecords: recordedBlockchain,
        failedRecords: failedBlockchain,
        pendingRecords: pendingBlockchain,
      },
    };
  },

  async getGeographicStats() {
    // Groups scans count by country/province/district
    const geoGroups = await prisma.verificationEvent.groupBy({
      by: ['country', 'province', 'district'],
      _count: {
        id: true,
      },
    });

    return geoGroups.map((g) => ({
      country: g.country || 'Rwanda',
      province: g.province || 'Unknown Province',
      district: g.district || 'Unknown District',
      scanCount: g._count.id,
    }));
  },
};

export default analyticsRepository;
