import api from '../api';

export const businessesService = {
  create: (data) => api.post('/businesses', data),
  getAll: (params) => api.get('/businesses', { params }),
  getMe: () => api.get('/businesses/me'),
  getById: (id) => api.get(`/businesses/${id}`),
  update: (id, data) => api.patch(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
  updateStatus: (id, status) => api.patch(`/businesses/${id}/status`, { status }),
  verify: (id, verificationStatus) => api.patch(`/businesses/${id}/verify`, { verificationStatus }),
  getStatistics: (id) => api.get(`/businesses/${id}/statistics`),
  getAddress: (id) => api.get(`/businesses/${id}/address`),
  createAddress: (id, data) => api.post(`/businesses/${id}/address`, data),
  updateAddress: (id, data) => api.patch(`/businesses/${id}/address`, data),
  getDocuments: (id) => api.get(`/businesses/${id}/documents`),
  addDocument: (id, data) => api.post(`/businesses/${id}/documents`, data),
  deleteDocument: (id, documentId) => api.delete(`/businesses/${id}/documents/${documentId}`),
  verifyDocument: (id, documentId, verificationStatus) =>
    api.patch(`/businesses/${id}/documents/${documentId}/verify`, { verificationStatus }),
  getMembers: (id) => api.get(`/businesses/${id}/members`),
  addMember: (id, data) => api.post(`/businesses/${id}/members`, data),
  updateMemberRole: (id, memberId, role) =>
    api.patch(`/businesses/${id}/members/${memberId}`, { role }),
  removeMember: (id, memberId) => api.delete(`/businesses/${id}/members/${memberId}`),
};

// Document/product-document types the backend Joi schemas actually accept — used to populate
// selects so the UI never submits a value the API will reject.
export const BUSINESS_DOCUMENT_TYPES = [
  'Registration Certificate',
  'Tax Certificate',
  'Business Permit',
  'National ID',
  'Other',
];

export const BUSINESS_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'ACTIVE',
  'SUSPENDED',
  'ARCHIVED',
];

export const BUSINESS_MEMBER_ROLES = ['Owner', 'Manager', 'Employee'];

export default businessesService;
