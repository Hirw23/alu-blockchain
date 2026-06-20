import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import {
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
} from '../validators/admin.validator.js';

const router = Router();

// =========================================================================
// AUDIT LOGS
// =========================================================================
router.get(
  '/audit',
  authenticate,
  checkPermission('audit:view'),
  validateAdminSearchQuery,
  adminController.getAuditLogs
);

router.get(
  '/audit/:id',
  authenticate,
  checkPermission('audit:view'),
  adminController.getAuditLogById
);

// =========================================================================
// SYSTEM SETTINGS & FEATURE FLAGS
// =========================================================================
router.get(
  '/settings',
  authenticate,
  checkPermission('settings:update'),
  adminController.getSettings
);

router.patch(
  '/settings',
  authenticate,
  checkPermission('settings:update'),
  validateSettingUpdate,
  adminController.updateSetting
);

router.get(
  '/features',
  authenticate,
  checkPermission('features:update'),
  adminController.getFeatureFlags
);

router.patch(
  '/features/:id',
  authenticate,
  checkPermission('features:update'),
  validateFeatureFlagUpdate,
  adminController.updateFeatureFlag
);

// =========================================================================
// NOTIFICATIONS MANAGEMENT
// =========================================================================
router.get(
  '/notifications',
  authenticate,
  checkPermission('notifications:manage'),
  adminController.getNotifications
);

router.post(
  '/notifications',
  authenticate,
  checkPermission('notifications:manage'),
  validateNotification,
  adminController.createNotification
);

router.patch(
  '/notifications/:id',
  authenticate,
  checkPermission('notifications:manage'),
  validateNotificationUpdate,
  adminController.updateNotification
);

router.delete(
  '/notifications/:id',
  authenticate,
  checkPermission('notifications:manage'),
  adminController.deleteNotification
);

// =========================================================================
// ANNOUNCEMENTS
// =========================================================================
router.get(
  '/announcements',
  authenticate,
  checkPermission('announcements:manage'),
  adminController.getAnnouncements
);

router.post(
  '/announcements',
  authenticate,
  checkPermission('announcements:manage'),
  validateAnnouncement,
  adminController.createAnnouncement
);

router.patch(
  '/announcements/:id',
  authenticate,
  checkPermission('announcements:manage'),
  validateAnnouncementUpdate,
  adminController.updateAnnouncement
);

router.delete(
  '/announcements/:id',
  authenticate,
  checkPermission('announcements:manage'),
  adminController.deleteAnnouncement
);

// =========================================================================
// USER ADMINISTRATION
// =========================================================================
router.get(
  '/users',
  authenticate,
  checkPermission('users:manage'),
  validateAdminSearchQuery,
  adminController.getUsers
);

router.patch(
  '/users/:id/status',
  authenticate,
  checkPermission('users:manage'),
  validateUserStatusUpdate,
  adminController.updateUserStatus
);

router.patch(
  '/users/:id/roles',
  authenticate,
  checkPermission('users:manage'),
  validateUserRolesUpdate,
  adminController.updateUserRoles
);

// =========================================================================
// ROLES & RBAC
// =========================================================================
router.get('/roles', authenticate, checkPermission('roles:manage'), adminController.getRoles);

router.post(
  '/roles',
  authenticate,
  checkPermission('roles:manage'),
  validateRoleCreate,
  adminController.createRole
);

router.patch(
  '/roles/:id',
  authenticate,
  checkPermission('roles:manage'),
  validateRoleUpdate,
  adminController.updateRole
);

router.delete(
  '/roles/:id',
  authenticate,
  checkPermission('roles:manage'),
  adminController.deleteRole
);

router.get(
  '/permissions',
  authenticate,
  checkPermission('permissions:manage'),
  adminController.getPermissions
);

router.post(
  '/roles/:id/permissions',
  authenticate,
  checkPermission('permissions:manage'),
  validateRolePermissionsAssign,
  adminController.assignPermissions
);

// =========================================================================
// MAINTENANCE MODES
// =========================================================================
router.get(
  '/maintenance',
  authenticate,
  checkPermission('maintenance:manage'),
  adminController.getMaintenanceWindows
);

router.post(
  '/maintenance',
  authenticate,
  checkPermission('maintenance:manage'),
  validateMaintenanceWindow,
  adminController.createMaintenanceWindow
);

router.patch(
  '/maintenance',
  authenticate,
  checkPermission('maintenance:manage'),
  validateMaintenanceWindowUpdate,
  adminController.toggleMaintenanceMode
);

export default router;
