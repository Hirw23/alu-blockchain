import api from '../api';

export const productsService = {
  create: (data) => api.post('/products', data),
  getAll: (params) => api.get('/products', { params }),
  getMe: (params) => api.get('/products/me', { params }),
  search: (params) => api.get('/products/search', { params }),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStatus: (id, status) => api.patch(`/products/${id}/status`, { status }),
  updateInventory: (id, data) => api.patch(`/products/${id}/inventory`, data),
  getStatistics: (id) => api.get(`/products/${id}/statistics`),

  getTimeline: (id) => api.get(`/products/${id}/timeline`),
  getCurrentStage: (id) => api.get(`/products/${id}/current-stage`),
  getHistory: (id) => api.get(`/products/${id}/history`),

  addVariant: (id, data) => api.post(`/products/${id}/variants`, data),
  getVariants: (id) => api.get(`/products/${id}/variants`),
  updateVariant: (id, variantId, data) => api.patch(`/products/${id}/variants/${variantId}`, data),
  deleteVariant: (id, variantId) => api.delete(`/products/${id}/variants/${variantId}`),

  addImage: (id, data) => api.post(`/products/${id}/images`, data),
  getImages: (id) => api.get(`/products/${id}/images`),
  deleteImage: (id, imageId) => api.delete(`/products/${id}/images/${imageId}`),
  updateImageOrder: (id, imageId, displayOrder) =>
    api.patch(`/products/${id}/images/${imageId}/order`, { displayOrder }),

  addDocument: (id, data) => api.post(`/products/${id}/documents`, data),
  getDocuments: (id) => api.get(`/products/${id}/documents`),
  deleteDocument: (id, documentId) => api.delete(`/products/${id}/documents/${documentId}`),
};

export const PRODUCT_STATUSES = [
  'DRAFT',
  'REGISTERED',
  'VERIFIED',
  'ACTIVE',
  'OUT_OF_STOCK',
  'DISCONTINUED',
  'ARCHIVED',
];

export const PRODUCT_DOCUMENT_TYPES = [
  'Certificate',
  'Product Label',
  'Safety Sheet',
  'Manufacturing Certificate',
  'Other',
];

export default productsService;
