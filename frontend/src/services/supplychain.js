import api from '../api';

export const supplyChainService = {
  getEventTypes: () => api.get('/supply-chain/event-types'),
  create: (data) => api.post('/supply-chain/events', data),
  getAll: (params) => api.get('/supply-chain/events', { params }),
  getById: (id) => api.get(`/supply-chain/events/${id}`),
  update: (id, data) => api.patch(`/supply-chain/events/${id}`, data),
  delete: (id) => api.delete(`/supply-chain/events/${id}`),
  updateStatus: (id, status) => api.patch(`/supply-chain/events/${id}/status`, { status }),
  updateLocation: (id, data) => api.post(`/supply-chain/events/${id}/location`, data),
  addAttachment: (id, data) => api.post(`/supply-chain/events/${id}/attachments`, data),
  deleteAttachment: (id, attachmentId) =>
    api.delete(`/supply-chain/events/${id}/attachments/${attachmentId}`),
  postComment: (id, comment) => api.post(`/supply-chain/events/${id}/comments`, { comment }),
  deleteComment: (id, commentId) => api.delete(`/supply-chain/events/${id}/comments/${commentId}`),
};

// Seeded in prisma/seed.js — used to render the event-type select without a network round trip
// before the real list loads, and as a fallback grouping reference.
export const EVENT_TYPE_CATEGORIES = [
  'Production',
  'Quality',
  'Storage',
  'Transportation',
  'Retail',
  'Other',
];

export const EVENT_STATUSES = ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'LOCKED'];

export const ATTACHMENT_DOCUMENT_TYPES = [
  'Image',
  'PDF',
  'Certificate',
  'Delivery Note',
  'Receipt',
  'Inspection Report',
  'Other',
];

export default supplyChainService;
