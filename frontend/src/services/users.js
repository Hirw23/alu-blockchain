import api from '../api';

export const usersService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  getMyNotifications: (params) => api.get('/users/me/notifications', { params }),
  markNotificationRead: (id) => api.patch(`/users/me/notifications/${id}/read`),
  getMyActivity: (params) => api.get('/users/me/activity', { params }),
};

export default usersService;
