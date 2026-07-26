import api from '../api';

export const qrService = {
  createIdentity: (productId, expiresAt) =>
    api.post(`/products/${productId}/identity`, expiresAt ? { expiresAt } : {}),
  getIdentity: (productId) => api.get(`/products/${productId}/identity`),
  updateIdentity: (productId, expiresAt) => api.patch(`/products/${productId}/identity`, { expiresAt }),
  deleteIdentity: (productId) => api.delete(`/products/${productId}/identity`),
  updateStatus: (productId, status) =>
    api.patch(`/products/${productId}/identity/status`, { status }),

  generate: (productId, data) => api.post(`/products/${productId}/qr`, data),
  regenerate: (productId, data) => api.post(`/products/${productId}/qr/regenerate`, data),
  bulkGenerate: (productIds, format) => api.post('/products/bulk-qr', { productIds, format }),

  // These routes require a Bearer token, so a plain <img src="..."> won't authenticate —
  // fetch as a blob via axios and turn it into an object URL for display/download instead.
  previewImage: (productId, format) =>
    api.get(`/products/${productId}/qr/preview`, { params: format ? { format } : {}, responseType: 'blob' }),
  downloadImage: (productId, format) =>
    api.get(`/products/${productId}/qr/download`, { params: format ? { format } : {}, responseType: 'blob' }),
  getAssets: (productId) => api.get(`/products/${productId}/qr/assets`),
  deleteAsset: (productId, assetId) => api.delete(`/products/${productId}/qr/assets/${assetId}`),

  getVerifications: (productId, params) =>
    api.get(`/products/${productId}/verifications`, { params }),
  getStatistics: (productId) => api.get(`/products/${productId}/verifications/statistics`),
  getLatestScan: (productId) => api.get(`/products/${productId}/verifications/latest`),

  // Public, unauthenticated trust-card lookup — no /api/v1 prefix, mounted at API root.
  verifyToken: (token) =>
    api.get(`${api.defaults.baseURL.replace('/api/v1', '')}/api/public/verify/${token}`),
};

export const QR_FORMATS = ['PNG', 'SVG', 'PDF'];

export const QR_STATUSES = [
  'GENERATED',
  'ACTIVATED',
  'PRINTED',
  'ACTIVE',
  'EXPIRED',
  'REVOKED',
  'ARCHIVED',
];

export default qrService;
