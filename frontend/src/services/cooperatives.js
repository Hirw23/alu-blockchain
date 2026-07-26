import api from '../api';

export const cooperativesService = {
  create: (data) => api.post('/cooperatives', data),
  getAll: (params) => api.get('/cooperatives', { params }),
  getById: (id) => api.get(`/cooperatives/${id}`),
  update: (id, data) => api.patch(`/cooperatives/${id}`, data),
  delete: (id) => api.delete(`/cooperatives/${id}`),
  getBusinesses: (id) => api.get(`/cooperatives/${id}/businesses`),
  addBusiness: (id, businessId) => api.post(`/cooperatives/${id}/businesses`, { businessId }),
  removeBusiness: (id, businessId) => api.delete(`/cooperatives/${id}/businesses/${businessId}`),
};

export default cooperativesService;
