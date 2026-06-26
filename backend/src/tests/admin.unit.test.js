import { jest } from '@jest/globals';

// ============================================================
// Unit tests for adminService business logic
// Tests audit logging, maintenance mode detection, and
// notification ownership guards
// ============================================================

const mockAdminRepo = {
  createAuditLog: jest.fn(),
  getAuditLogs: jest.fn(),
  createNotification: jest.fn(),
  getNotifications: jest.fn(),
  updateNotification: jest.fn(),
  deleteNotification: jest.fn(),
  getSettings: jest.fn(),
  updateSetting: jest.fn(),
  getFeatureFlags: jest.fn(),
  updateFeatureFlag: jest.fn(),
  getSettingByKey: jest.fn(),
  getMaintenanceWindows: jest.fn(),
  createMaintenanceWindow: jest.fn(),
  getUsers: jest.fn(),
  updateUserStatus: jest.fn(),
  updateUserRole: jest.fn(),
  getRoles: jest.fn(),
  createRole: jest.fn(),
  getPermissions: jest.fn(),
  assignPermissions: jest.fn(),
  getActivityLogs: jest.fn(),
};

const mockPrisma = {
  $queryRaw: jest.fn(),
};

jest.unstable_mockModule('../repositories/admin.repository.js', () => ({
  default: mockAdminRepo,
  adminRepository: mockAdminRepo,
}));

jest.unstable_mockModule('../database/client.js', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

const { adminService } = await import('../services/admin.service.js');

describe('AdminService — Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('logEvent()', () => {
    it('should call createAuditLog and hash the IP address', async () => {
      mockAdminRepo.createAuditLog.mockResolvedValue({ id: 'log-1' });

      await adminService.logEvent(
        'USER_LOGIN', 'User', 'usr-1', 'usr-1', 'Entrepreneur', '127.0.0.1'
      );

      expect(mockAdminRepo.createAuditLog).toHaveBeenCalledTimes(1);
      const callArg = mockAdminRepo.createAuditLog.mock.calls[0][0];
      // IP must be hashed — should NOT contain the raw IP
      expect(callArg.ipHash).not.toBe('127.0.0.1');
      expect(callArg.ipHash).toHaveLength(64); // SHA-256 hex digest
    });

    it('should fall back gracefully when ipAddress is null', async () => {
      mockAdminRepo.createAuditLog.mockResolvedValue({ id: 'log-2' });
      await adminService.logEvent('USER_LOGIN', 'User', 'usr-1', 'usr-1', 'Entrepreneur', null);
      expect(mockAdminRepo.createAuditLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('markNotificationRead()', () => {
    it('should throw NotFoundError when notification does not belong to the user', async () => {
      mockAdminRepo.getNotifications.mockResolvedValue([
        { id: 'notif-1', recipientId: 'usr-1' },
      ]);

      await expect(
        adminService.markNotificationRead('notif-99', 'usr-1')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should call updateNotification for matching notification', async () => {
      mockAdminRepo.getNotifications.mockResolvedValue([
        { id: 'notif-1', recipientId: 'usr-1' },
      ]);
      mockAdminRepo.updateNotification.mockResolvedValue({ id: 'notif-1', status: 'READ' });

      const result = await adminService.markNotificationRead('notif-1', 'usr-1');
      expect(mockAdminRepo.updateNotification).toHaveBeenCalledWith('notif-1', { status: 'READ' });
      expect(result.status).toBe('READ');
    });
  });

  describe('isMaintenanceModeActive()', () => {
    it('should return true when Maintenance Mode setting is "true"', async () => {
      mockAdminRepo.getSettingByKey.mockResolvedValue({ settingKey: 'Maintenance Mode', settingValue: 'true' });
      mockAdminRepo.getMaintenanceWindows.mockResolvedValue([]);

      const result = await adminService.isMaintenanceModeActive();
      expect(result).toBe(true);
    });

    it('should return false when Maintenance Mode setting is "false" and no active windows', async () => {
      mockAdminRepo.getSettingByKey.mockResolvedValue({ settingKey: 'Maintenance Mode', settingValue: 'false' });
      mockAdminRepo.getMaintenanceWindows.mockResolvedValue([]);

      const result = await adminService.isMaintenanceModeActive();
      expect(result).toBe(false);
    });

    it('should return true when a maintenance window is currently active', async () => {
      mockAdminRepo.getSettingByKey.mockResolvedValue({ settingKey: 'Maintenance Mode', settingValue: 'false' });
      const now = new Date();
      mockAdminRepo.getMaintenanceWindows.mockResolvedValue([
        {
          enabled: true,
          startsAt: new Date(now.getTime() - 60000).toISOString(), // 1 min ago
          endsAt: new Date(now.getTime() + 60000).toISOString(),   // 1 min ahead
        },
      ]);

      const result = await adminService.isMaintenanceModeActive();
      expect(result).toBe(true);
    });
  });

  describe('getSystemHealth()', () => {
    it('should return HEALTHY when database query succeeds', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([1]);
      const result = await adminService.getSystemHealth();
      expect(result.status).toBe('HEALTHY');
      expect(result.details.database).toBe('UP');
    });

    it('should return UNHEALTHY when database query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('DB connection refused'));
      const result = await adminService.getSystemHealth();
      expect(result.status).toBe('UNHEALTHY');
      expect(result.details.database).toBe('DOWN');
    });
  });
});
