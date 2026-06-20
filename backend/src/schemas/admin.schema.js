import Joi from 'joi';

export const announcementSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  message: Joi.string().min(5).max(1000).required(),
  audience: Joi.string()
    .valid('ALL_USERS', 'ENTREPRENEURS', 'COOPERATIVES', 'ADMINISTRATORS')
    .required(),
  priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH').default('NORMAL'),
  expiresAt: Joi.date().iso().greater('now').optional(),
});

export const announcementUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  message: Joi.string().min(5).max(1000).optional(),
  audience: Joi.string()
    .valid('ALL_USERS', 'ENTREPRENEURS', 'COOPERATIVES', 'ADMINISTRATORS')
    .optional(),
  priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH').optional(),
  published: Joi.boolean().optional(),
  expiresAt: Joi.date().iso().greater('now').optional(),
});

export const notificationSchema = Joi.object({
  recipientId: Joi.string().uuid().required(),
  notificationType: Joi.string()
    .valid(
      'BUSINESS_APPROVED',
      'BUSINESS_SUSPENDED',
      'PRODUCT_APPROVED',
      'QR_GENERATED',
      'VERIFICATION_FAILED',
      'SUPPLY_CHAIN_UPDATE',
      'ANNOUNCEMENT',
      'SYSTEM_ALERT'
    )
    .required(),
  title: Joi.string().min(3).max(100).required(),
  message: Joi.string().min(3).max(500).required(),
});

export const notificationUpdateSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'DELIVERED', 'READ', 'ARCHIVED').required(),
});

export const settingUpdateSchema = Joi.object({
  settingKey: Joi.string().required(),
  settingValue: Joi.string().required(),
  description: Joi.string().optional(),
});

export const featureFlagUpdateSchema = Joi.object({
  enabled: Joi.boolean().required(),
  description: Joi.string().optional(),
});

export const maintenanceWindowSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().optional(),
  startsAt: Joi.date().iso().required(),
  endsAt: Joi.date().iso().greater(Joi.ref('startsAt')).required(),
  enabled: Joi.boolean().default(false),
});

export const maintenanceWindowUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().optional(),
  startsAt: Joi.date().iso().optional(),
  endsAt: Joi.date().iso().optional(),
  enabled: Joi.boolean().optional(),
});

export const userStatusUpdateSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED').required(),
});

export const userRolesUpdateSchema = Joi.object({
  roleId: Joi.string().uuid().required(),
});

export const roleCreateSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().optional(),
});

export const roleUpdateSchema = Joi.object({
  description: Joi.string().optional(),
});

export const rolePermissionsAssignSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

export const adminSearchQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
  role: Joi.string().optional(),
  status: Joi.string().optional(),
  action: Joi.string().optional(),
  audience: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export default {
  announcementSchema,
  announcementUpdateSchema,
  notificationSchema,
  notificationUpdateSchema,
  settingUpdateSchema,
  featureFlagUpdateSchema,
  maintenanceWindowSchema,
  maintenanceWindowUpdateSchema,
  userStatusUpdateSchema,
  userRolesUpdateSchema,
  roleCreateSchema,
  roleUpdateSchema,
  rolePermissionsAssignSchema,
  adminSearchQuerySchema,
};
