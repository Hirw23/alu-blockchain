import api from '../api';

export const adminService = {
  getAuditLogs: (params) => api.get('/admin/audit', { params }),
  getAuditLogById: (id) => api.get(`/admin/audit/${id}`),

  getSettings: () => api.get('/admin/settings'),
  updateSetting: (settingKey, settingValue, description) =>
    api.patch('/admin/settings', { settingKey, settingValue, description }),

  getFeatureFlags: () => api.get('/admin/features'),
  updateFeatureFlag: (id, enabled) => api.patch(`/admin/features/${id}`, { enabled }),

  getNotifications: (params) => api.get('/admin/notifications', { params }),
  createNotification: (data) => api.post('/admin/notifications', data),
  updateNotification: (id, data) => api.patch(`/admin/notifications/${id}`, data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),

  getAnnouncements: (params) => api.get('/admin/announcements', { params }),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.patch(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  getPublicAnnouncements: () => api.get('/announcements'),

  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  updateUserRoles: (id, roleId) => api.patch(`/admin/users/${id}/roles`, { roleId }),

  getRoles: () => api.get('/admin/roles'),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.patch(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  getPermissions: () => api.get('/admin/permissions'),
  assignPermissions: (roleId, permissionIds) =>
    api.post(`/admin/roles/${roleId}/permissions`, { permissionIds }),

  getMaintenanceWindows: () => api.get('/admin/maintenance'),
  createMaintenanceWindow: (data) => api.post('/admin/maintenance', data),
  toggleMaintenanceMode: (enabled) => api.patch('/admin/maintenance', { enabled }),

  getSystemHealth: () => api.get('/health'),
  getSystemHealthDetails: () => api.get('/health/details'),
};

export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED'];
export const ANNOUNCEMENT_AUDIENCES = [
  'ALL_USERS',
  'ENTREPRENEURS',
  'COOPERATIVES',
  'ADMINISTRATORS',
];
export const ANNOUNCEMENT_PRIORITIES = ['LOW', 'NORMAL', 'HIGH'];

export default adminService;
