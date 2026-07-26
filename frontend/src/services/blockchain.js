import api from '../api';

export const blockchainService = {
  getNetworkStatus: () => api.get('/blockchain/status'),
  recordEvent: (eventId) => api.post(`/blockchain/events/${eventId}`),
  getAnchorStatus: (eventId) => api.get(`/blockchain/anchor-status/${eventId}`),
  getEventInfo: (eventId) => api.get(`/blockchain/events/${eventId}`),
  getEventHistory: (eventId) => api.get(`/blockchain/events/${eventId}/history`),
  getTransactionDetails: (transactionId) => api.get(`/blockchain/transactions/${transactionId}`),
};

export default blockchainService;
