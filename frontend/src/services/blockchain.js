import api from '../api';

export const blockchainService = {
  getNetworkStatus: () => api.get('/blockchain/status'),
  recordEvent: (eventId) => api.post(`/blockchain/events/${eventId}`),
  getAnchorStatus: (eventId) => api.get(`/blockchain/anchor-status/${eventId}`),
  getEventInfo: (eventId) => api.get(`/blockchain/events/${eventId}`),
  getEventHistory: (eventId) => api.get(`/blockchain/events/${eventId}/history`),
  getTransactionDetails: (transactionId) => api.get(`/blockchain/transactions/${transactionId}`),
  getRecentProducts: () => api.get('/blockchain/products'),
  anchorProduct: (productId) => api.post(`/blockchain/products/${productId}`),
  getProductInfo: (productId) => api.get(`/blockchain/products/${productId}`),
  getRecentIdentities: () => api.get('/blockchain/identities'),
  anchorIdentity: (identityId) => api.post(`/blockchain/identities/${identityId}`),
  getIdentityInfo: (identityId) => api.get(`/blockchain/identities/${identityId}`),
};

export default blockchainService;
