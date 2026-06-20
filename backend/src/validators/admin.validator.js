import validate from '../middleware/validator.js';
import {
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
} from '../schemas/admin.schema.js';

export const validateAnnouncement = validate(announcementSchema, 'body');
export const validateAnnouncementUpdate = validate(announcementUpdateSchema, 'body');
export const validateNotification = validate(notificationSchema, 'body');
export const validateNotificationUpdate = validate(notificationUpdateSchema, 'body');
export const validateSettingUpdate = validate(settingUpdateSchema, 'body');
export const validateFeatureFlagUpdate = validate(featureFlagUpdateSchema, 'body');
export const validateMaintenanceWindow = validate(maintenanceWindowSchema, 'body');
export const validateMaintenanceWindowUpdate = validate(maintenanceWindowUpdateSchema, 'body');
export const validateUserStatusUpdate = validate(userStatusUpdateSchema, 'body');
export const validateUserRolesUpdate = validate(userRolesUpdateSchema, 'body');
export const validateRoleCreate = validate(roleCreateSchema, 'body');
export const validateRoleUpdate = validate(roleUpdateSchema, 'body');
export const validateRolePermissionsAssign = validate(rolePermissionsAssignSchema, 'body');
export const validateAdminSearchQuery = validate(adminSearchQuerySchema, 'query');

export default {
  validateAnnouncement,
  validateAnnouncementUpdate,
  validateNotification,
  validateNotificationUpdate,
  validateSettingUpdate,
  validateFeatureFlagUpdate,
  validateMaintenanceWindow,
  validateMaintenanceWindowUpdate,
  validateUserStatusUpdate,
  validateUserRolesUpdate,
  validateRoleCreate,
  validateRoleUpdate,
  validateRolePermissionsAssign,
  validateAdminSearchQuery,
};
