import prisma from '../database/client.js';

export const adminRepository = {
  // =========================================================================
  // SETTINGS & FEATURE FLAGS
  // =========================================================================

  async getSettings() {
    return prisma.platformSetting.findMany();
  },

  async getSettingByKey(settingKey) {
    return prisma.platformSetting.findUnique({
      where: { settingKey },
    });
  },

  async updateSetting(settingKey, settingValue, userId) {
    return prisma.platformSetting.upsert({
      where: { settingKey },
      update: { settingValue, updatedBy: userId },
      create: { settingKey, settingValue, category: 'System', updatedBy: userId },
    });
  },

  async getFeatureFlags() {
    return prisma.featureFlag.findMany();
  },

  async getFeatureFlagByName(featureName) {
    return prisma.featureFlag.findUnique({
      where: { featureName },
    });
  },

  async updateFeatureFlag(id, enabled, userId) {
    return prisma.featureFlag.update({
      where: { id },
      data: { enabled, updatedBy: userId },
    });
  },

  // =========================================================================
  // AUDIT LOGGING (IMMUTABLE)
  // =========================================================================

  async createAuditLog(data) {
    return prisma.auditLog.create({
      data,
    });
  },

  async getAuditLogs(filters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  },

  async getAuditLogById(id) {
    return prisma.auditLog.findUnique({
      where: { id },
    });
  },

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================

  async createNotification(data) {
    return prisma.notification.create({
      data,
    });
  },

  async getNotifications(filters = {}) {
    const where = {};
    if (filters.recipientId) {
      where.recipientId = filters.recipientId;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateNotification(id, data) {
    const updateData = { ...data };
    if (data.status === 'READ') {
      updateData.readAt = new Date();
    }
    return prisma.notification.update({
      where: { id },
      data: updateData,
    });
  },

  async deleteNotification(id) {
    return prisma.notification.delete({
      where: { id },
    });
  },

  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================

  async createAnnouncement(data, userId) {
    return prisma.announcement.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  },

  async getAnnouncements(filters = {}) {
    const where = {};
    if (filters.audience) {
      where.audience = filters.audience;
    }
    if (filters.published !== undefined) {
      where.published = filters.published;
    }

    return prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateAnnouncement(id, data) {
    return prisma.announcement.update({
      where: { id },
      data,
    });
  },

  async deleteAnnouncement(id) {
    return prisma.announcement.delete({
      where: { id },
    });
  },

  // =========================================================================
  // USER ADMINISTRATION
  // =========================================================================

  async getUsers(filters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (filters.role) {
      where.role = { name: filters.role };
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { role: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  async updateUserStatus(id, status) {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  },

  async updateUserRole(id, roleId) {
    return prisma.user.update({
      where: { id },
      data: { roleId },
    });
  },

  // =========================================================================
  // ROLES & RBAC
  // =========================================================================

  async getRoles() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  },

  async createRole(data) {
    return prisma.role.create({
      data,
    });
  },

  async updateRole(id, data) {
    return prisma.role.update({
      where: { id },
      data,
    });
  },

  async deleteRole(id) {
    return prisma.role.delete({
      where: { id },
    });
  },

  async getPermissions() {
    return prisma.permission.findMany();
  },

  async assignPermissions(roleId, permissionIds) {
    // Delete existing maps
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Bulk insert new permission mappings
    const mappings = permissionIds.map((pid) => ({
      roleId,
      permissionId: pid,
    }));

    return prisma.rolePermission.createMany({
      data: mappings,
    });
  },

  // =========================================================================
  // USER ACTIVITY LOGGING
  // =========================================================================

  async createActivityLog(data) {
    return prisma.activityLog.create({
      data,
    });
  },

  async getActivityLogs(userId) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAdminActivityLogs() {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  // =========================================================================
  // MAINTENANCE MANAGEMENT
  // =========================================================================

  async createMaintenanceWindow(data, userId) {
    return prisma.maintenanceWindow.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  },

  async getMaintenanceWindows() {
    return prisma.maintenanceWindow.findMany({
      orderBy: { startsAt: 'desc' },
    });
  },

  async updateMaintenanceWindow(id, data) {
    return prisma.maintenanceWindow.update({
      where: { id },
      data,
    });
  },
};

export default adminRepository;
