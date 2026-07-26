import api from '../api';

// Generic /notifications CRUD (routes.md #151-153) — separate from the personal inbox at
// /users/me/notifications (see services/users.js) and from admin broadcast management at
// /admin/notifications (see services/admin.js).
export const notificationsService = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
};

export default notificationsService;
