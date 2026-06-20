import crypto from 'crypto';
import adminRepository from '../repositories/admin.repository.js';
import prisma from '../database/client.js';
import { NotFoundError } from '../utils/errors.js';

export const adminService = {
  // =========================================================================
  // AUDIT SERVICE (IMMUTABLE LOGGING)
  // =========================================================================

  async logEvent(
    action,
    entityType,
    entityId,
    performedBy,
    userRole,
    ipAddress,
    outcome = 'SUCCESS',
    userAgent = null,
    metadata = {}
  ) {
    // Generate SHA-256 IP address hash to protect privacy while preserving forensic audit capability
    const ipHash = crypto
      .createHash('sha256')
      .update(ipAddress || '127.0.0.1')
      .digest('hex');

    return adminRepository.createAuditLog({
      action,
      entityType,
      entityId,
      performedBy,
      userRole,
      ipHash,
      userAgent,
      outcome,
      metadata: JSON.stringify(metadata),
    });
  },

  async getAuditLogs(filters) {
    return adminRepository.getAuditLogs(filters);
  },

  // =========================================================================
  // NOTIFICATIONS ENGINE
  // =========================================================================

  async sendNotification(recipientId, notificationType, title, message) {
    return adminRepository.createNotification({
      recipientId,
      notificationType,
      title,
      message,
      status: 'PENDING',
    });
  },

  async getNotifications(filters) {
    return adminRepository.getNotifications(filters);
  },

  async markNotificationRead(id, userId) {
    const notifications = await adminRepository.getNotifications({ recipientId: userId });
    const exists = notifications.find((n) => n.id === id);
    if (!exists) {
      throw new NotFoundError('Notification not found');
    }

    return adminRepository.updateNotification(id, { status: 'READ' });
  },

  async deleteNotification(id) {
    return adminRepository.deleteNotification(id);
  },

  // =========================================================================
  // ANNOUNCEMENTS FEED
  // =========================================================================

  async createAnnouncement(data, userId) {
    return adminRepository.createAnnouncement(data, userId);
  },

  async getAnnouncements(filters) {
    return adminRepository.getAnnouncements(filters);
  },

  async updateAnnouncement(id, data) {
    return adminRepository.updateAnnouncement(id, data);
  },

  async deleteAnnouncement(id) {
    return adminRepository.deleteAnnouncement(id);
  },

  // =========================================================================
  // SETTINGS & FEATURES CONFIGURATION
  // =========================================================================

  async updateSetting(settingKey, settingValue, userId) {
    return adminRepository.updateSetting(settingKey, settingValue, userId);
  },

  async getSettings() {
    return adminRepository.getSettings();
  },

  async getFeatureFlags() {
    return adminRepository.getFeatureFlags();
  },

  async updateFeatureFlag(id, enabled, userId) {
    return adminRepository.updateFeatureFlag(id, enabled, userId);
  },

  // =========================================================================
  // USER TIMELINES & PROFILE CONTROLS
  // =========================================================================

  async getUsers(filters) {
    return adminRepository.getUsers(filters);
  },

  async updateUserStatus(id, status) {
    return adminRepository.updateUserStatus(id, status);
  },

  async updateUserRole(id, roleId) {
    return adminRepository.updateUserRole(id, roleId);
  },

  async getActivityLogs(userId) {
    return adminRepository.getActivityLogs(userId);
  },

  // =========================================================================
  // ROLES & RBAC
  // =========================================================================

  async getRoles() {
    return adminRepository.getRoles();
  },

  async createRole(data) {
    return adminRepository.createRole(data);
  },

  async updateRole(id, data) {
    return adminRepository.updateRole(id, data);
  },

  async deleteRole(id) {
    return adminRepository.deleteRole(id);
  },

  async getPermissions() {
    return adminRepository.getPermissions();
  },

  async assignPermissions(roleId, permissionIds) {
    return adminRepository.assignPermissions(roleId, permissionIds);
  },

  // =========================================================================
  // PLATFORM SYSTEM HEALTH
  // =========================================================================

  async getSystemHealth() {
    let dbStatus = 'UP';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      console.error('System Health check database failure:', err.message);
      dbStatus = 'DOWN';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'UP' ? 'HEALTHY' : 'UNHEALTHY',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      details: {
        database: dbStatus,
        memoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        },
      },
    };
  },

  // =========================================================================
  // MAINTENANCE WINDOW MANAGER
  // =========================================================================

  async createMaintenanceWindow(data, userId) {
    return adminRepository.createMaintenanceWindow(data, userId);
  },

  async getMaintenanceWindows() {
    return adminRepository.getMaintenanceWindows();
  },

  async isMaintenanceModeActive() {
    // Check if maintenance mode setting is toggled to active
    const setting = await adminRepository.getSettingByKey('Maintenance Mode');
    if (setting && setting.settingValue === 'true') {
      return true;
    }

    // Check if current date falls within any active maintenance window
    const now = new Date();
    const windows = await adminRepository.getMaintenanceWindows();
    const activeWindow = windows.find(
      (w) => w.enabled && new Date(w.startsAt) <= now && new Date(w.endsAt) >= now
    );

    return !!activeWindow;
  },
};

export default adminService;
