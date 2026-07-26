import api from '../api';

export const productCategoriesService = {
  getTree: () => api.get('/product-categories/tree'),
  create: (data) => api.post('/product-categories', data),
  getAll: (params) => api.get('/product-categories', { params }),
  getById: (id) => api.get(`/product-categories/${id}`),
  update: (id, data) => api.patch(`/product-categories/${id}`, data),
  delete: (id) => api.delete(`/product-categories/${id}`),
};

export default productCategoriesService;
