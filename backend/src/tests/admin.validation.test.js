import {
  announcementSchema,
  notificationSchema,
  settingUpdateSchema,
  featureFlagUpdateSchema,
  maintenanceWindowSchema,
  userStatusUpdateSchema,
  roleCreateSchema,
  rolePermissionsAssignSchema,
  adminSearchQuerySchema,
} from '../schemas/admin.schema.js';

// ============================================================
// Validation tests for admin Joi schemas
// ============================================================

const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Admin Schemas — Validation Tests', () => {
  describe('announcementSchema', () => {
    const valid = {
      title: 'System Maintenance',
      message: 'The platform will be down for upgrades from 12am to 2am.',
      audience: 'ALL_USERS',
    };

    it('should pass for a fully valid announcement', () => {
      const { error } = announcementSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when title is too short (< 3 chars)', () => {
      const { error } = announcementSchema.validate({ ...valid, title: 'AB' });
      expect(error).toBeDefined();
    });

    it('should fail when message is too short (< 5 chars)', () => {
      const { error } = announcementSchema.validate({ ...valid, message: 'Hi' });
      expect(error).toBeDefined();
    });

    it('should fail for unsupported audience value', () => {
      const { error } = announcementSchema.validate({ ...valid, audience: 'MANAGERS' });
      expect(error).toBeDefined();
    });

    it('should default priority to NORMAL when omitted', () => {
      const { value } = announcementSchema.validate(valid);
      expect(value.priority).toBe('NORMAL');
    });

    it('should fail when expiresAt is a past date', () => {
      const past = new Date(Date.now() - 1000).toISOString();
      const { error } = announcementSchema.validate({ ...valid, expiresAt: past });
      expect(error).toBeDefined();
    });
  });

  describe('notificationSchema', () => {
    const valid = {
      recipientId: validUUID,
      notificationType: 'BUSINESS_APPROVED',
      title: 'Your business has been approved',
      message: 'Congratulations! Your business is now active.',
    };

    it('should pass for a valid notification payload', () => {
      const { error } = notificationSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail for unsupported notificationType', () => {
      const { error } = notificationSchema.validate({ ...valid, notificationType: 'CUSTOM_ALERT' });
      expect(error).toBeDefined();
    });

    it('should fail when recipientId is not a UUID', () => {
      const { error } = notificationSchema.validate({ ...valid, recipientId: 'not-uuid' });
      expect(error).toBeDefined();
    });
  });

  describe('settingUpdateSchema', () => {
    it('should pass for valid setting key/value', () => {
      const { error } = settingUpdateSchema.validate({
        settingKey: 'Registration Enabled',
        settingValue: 'true',
      });
      expect(error).toBeUndefined();
    });

    it('should fail when settingKey is missing', () => {
      const { error } = settingUpdateSchema.validate({ settingValue: 'true' });
      expect(error).toBeDefined();
    });
  });

  describe('featureFlagUpdateSchema', () => {
    it('should pass with enabled = true', () => {
      const { error } = featureFlagUpdateSchema.validate({ enabled: true });
      expect(error).toBeUndefined();
    });

    it('should pass with enabled = false', () => {
      const { error } = featureFlagUpdateSchema.validate({ enabled: false });
      expect(error).toBeUndefined();
    });

    it('should fail when enabled is missing', () => {
      const { error } = featureFlagUpdateSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should fail when enabled is not a boolean', () => {
      const { error } = featureFlagUpdateSchema.validate({ enabled: 'yes' });
      expect(error).toBeDefined();
    });
  });

  describe('maintenanceWindowSchema', () => {
    const future1 = new Date(Date.now() + 3600000).toISOString(); // +1h
    const future2 = new Date(Date.now() + 7200000).toISOString(); // +2h

    it('should pass for a valid maintenance window', () => {
      const { error } = maintenanceWindowSchema.validate({
        title: 'DB Migration Window',
        startsAt: future1,
        endsAt: future2,
      });
      expect(error).toBeUndefined();
    });

    it('should fail when endsAt is before startsAt', () => {
      const { error } = maintenanceWindowSchema.validate({
        title: 'DB Migration Window',
        startsAt: future2,
        endsAt: future1, // reversed
      });
      expect(error).toBeDefined();
    });

    it('should fail when title is too short', () => {
      const { error } = maintenanceWindowSchema.validate({
        title: 'AB',
        startsAt: future1,
        endsAt: future2,
      });
      expect(error).toBeDefined();
    });
  });

  describe('userStatusUpdateSchema', () => {
    it('should pass for each valid user status', () => {
      for (const status of ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED']) {
        const { error } = userStatusUpdateSchema.validate({ status });
        expect(error).toBeUndefined();
      }
    });

    it('should fail for unsupported status', () => {
      const { error } = userStatusUpdateSchema.validate({ status: 'BANNED' });
      expect(error).toBeDefined();
    });
  });

  describe('roleCreateSchema', () => {
    it('should pass for a valid role name', () => {
      const { error } = roleCreateSchema.validate({ name: 'FieldAgent' });
      expect(error).toBeUndefined();
    });

    it('should fail when name is too short (< 2 chars)', () => {
      const { error } = roleCreateSchema.validate({ name: 'A' });
      expect(error).toBeDefined();
    });

    it('should fail when name is too long (> 50 chars)', () => {
      const { error } = roleCreateSchema.validate({ name: 'R'.repeat(51) });
      expect(error).toBeDefined();
    });
  });

  describe('rolePermissionsAssignSchema', () => {
    it('should pass with at least one UUID', () => {
      const { error } = rolePermissionsAssignSchema.validate({ permissionIds: [validUUID] });
      expect(error).toBeUndefined();
    });

    it('should fail when permissionIds is empty', () => {
      const { error } = rolePermissionsAssignSchema.validate({ permissionIds: [] });
      expect(error).toBeDefined();
    });

    it('should fail when a permissionId is not a UUID', () => {
      const { error } = rolePermissionsAssignSchema.validate({ permissionIds: ['not-uuid'] });
      expect(error).toBeDefined();
    });
  });

  describe('adminSearchQuerySchema', () => {
    it('should pass with no fields (all optional)', () => {
      const { error } = adminSearchQuerySchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should default page to 1 and limit to 10', () => {
      const { value } = adminSearchQuerySchema.validate({});
      expect(value.page).toBe(1);
      expect(value.limit).toBe(10);
    });

    it('should fail when limit exceeds 100', () => {
      const { error } = adminSearchQuerySchema.validate({ limit: 500 });
      expect(error).toBeDefined();
    });
  });
});
