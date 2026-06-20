import adminService from '../services/admin.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const adminController = {
  // =========================================================================
  // SETTINGS & FEATURE FLAGS
  // =========================================================================

  getSettings: asyncHandler(async (req, res) => {
    const settings = await adminService.getSettings();
    res.status(200).json(successResponse('Platform settings loaded', { settings }));
  }),

  updateSetting: asyncHandler(async (req, res) => {
    const { settingKey, settingValue } = req.body;
    const setting = await adminService.updateSetting(settingKey, settingValue, req.user.id);
    await adminService.logEvent(
      'UPDATE_SETTING',
      'PlatformSetting',
      setting.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(200).json(successResponse('Platform setting updated successfully', { setting }));
  }),

  getFeatureFlags: asyncHandler(async (req, res) => {
    const features = await adminService.getFeatureFlags();
    res.status(200).json(successResponse('Feature flags loaded', { features }));
  }),

  updateFeatureFlag: asyncHandler(async (req, res) => {
    const { enabled } = req.body;
    const flag = await adminService.updateFeatureFlag(req.params.id, enabled, req.user.id);
    await adminService.logEvent(
      'UPDATE_FEATURE_FLAG',
      'FeatureFlag',
      flag.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(200).json(successResponse('Feature flag status updated', { flag }));
  }),

  // =========================================================================
  // AUDIT LOGGING
  // =========================================================================

  getAuditLogs: asyncHandler(async (req, res) => {
    const result = await adminService.getAuditLogs(req.query);
    res.status(200).json(successResponse('Audit logs logs history loaded', result));
  }),

  getAuditLogById: asyncHandler(async (req, res) => {
    const log = await adminService.getAuditLogById(req.params.id);
    res.status(200).json(successResponse('Audit log details', { log }));
  }),

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================

  getNotifications: asyncHandler(async (req, res) => {
    const notifications = await adminService.getNotifications(req.query);
    res.status(200).json(successResponse('System notifications loaded', { notifications }));
  }),

  createNotification: asyncHandler(async (req, res) => {
    const { recipientId, notificationType, title, message } = req.body;
    const notification = await adminService.sendNotification(
      recipientId,
      notificationType,
      title,
      message
    );
    res.status(201).json(successResponse('Notification dispatched successfully', { notification }));
  }),

  updateNotification: asyncHandler(async (req, res) => {
    const notification = await adminService.updateNotification(req.params.id, req.body);
    res.status(200).json(successResponse('Notification status updated', { notification }));
  }),

  deleteNotification: asyncHandler(async (req, res) => {
    await adminService.deleteNotification(req.params.id);
    res.status(200).json(successResponse('Notification removed successfully'));
  }),

  getUserNotifications: asyncHandler(async (req, res) => {
    const notifications = await adminService.getNotifications({ recipientId: req.user.id });
    res.status(200).json(successResponse('Your notifications feed', { notifications }));
  }),

  markNotificationRead: asyncHandler(async (req, res) => {
    const notification = await adminService.markNotificationRead(req.params.id, req.user.id);
    res.status(200).json(successResponse('Notification marked as read', { notification }));
  }),

  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================

  getAnnouncements: asyncHandler(async (req, res) => {
    const announcements = await adminService.getAnnouncements(req.query);
    res.status(200).json(successResponse('Announcements logs retrieved', { announcements }));
  }),

  createAnnouncement: asyncHandler(async (req, res) => {
    const announcement = await adminService.createAnnouncement(req.body, req.user.id);
    await adminService.logEvent(
      'CREATE_ANNOUNCEMENT',
      'Announcement',
      announcement.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(201).json(successResponse('Announcement feed published', { announcement }));
  }),

  updateAnnouncement: asyncHandler(async (req, res) => {
    const announcement = await adminService.updateAnnouncement(req.params.id, req.body);
    await adminService.logEvent(
      'UPDATE_ANNOUNCEMENT',
      'Announcement',
      announcement.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(200).json(successResponse('Announcement modified successfully', { announcement }));
  }),

  deleteAnnouncement: asyncHandler(async (req, res) => {
    await adminService.deleteAnnouncement(req.params.id);
    await adminService.logEvent(
      'DELETE_ANNOUNCEMENT',
      'Announcement',
      req.params.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(200).json(successResponse('Announcement removed successfully'));
  }),

  getPublicAnnouncements: asyncHandler(async (req, res) => {
    let audience = 'ALL_USERS';
    if (req.user) {
      if (req.user.role === 'PlatformAdmin') audience = 'ADMINISTRATORS';
      else if (req.user.role === 'CooperativeAdmin') audience = 'COOPERATIVES';
      else if (req.user.role === 'Entrepreneur') audience = 'ENTREPRENEURS';
    }
    const announcements = await adminService.getAnnouncements({ audience, published: true });
    res.status(200).json(successResponse('Announcements bulletin feed', { announcements }));
  }),

  // =========================================================================
  // USER CONTROL
  // =========================================================================

  getUsers: asyncHandler(async (req, res) => {
    const result = await adminService.getUsers(req.query);
    res.status(200).json(successResponse('System user directory loaded', result));
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    const user = await adminService.updateUserStatus(req.params.id, req.body.status);
    await adminService.logEvent(
      'UPDATE_USER_STATUS',
      'User',
      user.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(200).json(successResponse('User account status set successfully', { user }));
  }),

  updateUserRoles: asyncHandler(async (req, res) => {
    const user = await adminService.updateUserRole(req.params.id, req.body.roleId);
    await adminService.logEvent(
      'UPDATE_USER_ROLE',
      'User',
      user.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(200).json(successResponse('User RBAC role reassigned', { user }));
  }),

  getUserActivity: asyncHandler(async (req, res) => {
    const timeline = await adminService.getActivityLogs(req.user.id);
    res.status(200).json(successResponse('Your activity logs history feed', { timeline }));
  }),

  // =========================================================================
  // ROLES & RBAC
  // =========================================================================

  getRoles: asyncHandler(async (req, res) => {
    const roles = await adminService.getRoles();
    res.status(200).json(successResponse('RBAC Roles registry loaded', { roles }));
  }),

  createRole: asyncHandler(async (req, res) => {
    const role = await adminService.createRole(req.body);
    res.status(201).json(successResponse('RBAC Role registered successfully', { role }));
  }),

  updateRole: asyncHandler(async (req, res) => {
    const role = await adminService.updateRole(req.params.id, req.body);
    res.status(200).json(successResponse('RBAC Role metadata updated', { role }));
  }),

  deleteRole: asyncHandler(async (req, res) => {
    await adminService.deleteRole(req.params.id);
    res.status(200).json(successResponse('RBAC Role deleted successfully'));
  }),

  getPermissions: asyncHandler(async (req, res) => {
    const permissions = await adminService.getPermissions();
    res.status(200).json(successResponse('Permissions registry loaded', { permissions }));
  }),

  assignPermissions: asyncHandler(async (req, res) => {
    await adminService.assignPermissions(req.params.id, req.body.permissionIds);
    res.status(200).json(successResponse('RBAC Permissions mapping applied successfully'));
  }),

  // =========================================================================
  // SYSTEM HEALTH
  // =========================================================================

  getSystemHealth: asyncHandler(async (req, res) => {
    const health = await adminService.getSystemHealth();
    res.status(200).json(successResponse('System health status analysis', health));
  }),

  // =========================================================================
  // MAINTENANCE WINDOWS
  // =========================================================================

  getMaintenanceWindows: asyncHandler(async (req, res) => {
    const windows = await adminService.getMaintenanceWindows();
    res.status(200).json(successResponse('Scheduled maintenance windows list', { windows }));
  }),

  createMaintenanceWindow: asyncHandler(async (req, res) => {
    const window = await adminService.createMaintenanceWindow(req.body, req.user.id);
    await adminService.logEvent(
      'CREATE_MAINTENANCE_WINDOW',
      'MaintenanceWindow',
      window.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res.status(201).json(successResponse('Maintenance window registered successfully', { window }));
  }),

  toggleMaintenanceMode: asyncHandler(async (req, res) => {
    const { enabled } = req.body;
    const value = enabled ? 'true' : 'false';
    const setting = await adminService.updateSetting('Maintenance Mode', value, req.user.id);
    await adminService.logEvent(
      'TOGGLE_MAINTENANCE_MODE',
      'PlatformSetting',
      setting.id,
      req.user.id,
      req.user.role,
      req.ip,
      'SUCCESS'
    );
    res
      .status(200)
      .json(successResponse('Platform maintenance mode set successfully', { setting }));
  }),
};

export default adminController;
