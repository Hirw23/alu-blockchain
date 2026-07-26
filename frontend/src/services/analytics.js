import api from '../api';

export const analyticsService = {
  // The backend resolves dashboard shape from req.user.role (Entrepreneur/Cooperative/Admin)
  // by default — the /dashboard/business|cooperative|admin path variants all hit the exact
  // same controller and only react to a `dashboardType` query param, not the URL suffix. Admin
  // dashboards additionally 403 unless the caller is actually PlatformAdmin.
  getDashboard: (dashboardType) =>
    api.get('/analytics/dashboard', { params: dashboardType ? { dashboardType } : {} }),
  getBusinessKPIs: (businessId) => api.get(`/analytics/business/${businessId}/kpis`),
  getBusinessTrends: (businessId) => api.get(`/analytics/business/${businessId}/trends`),
  compareProducts: (productIds) =>
    api.get('/analytics/products/comparison', { params: { productIds } }),
  getProductKPIs: (productId) => api.get(`/analytics/products/${productId}/kpis`),
  getVerificationGeography: () => api.get('/analytics/verifications/geography'),
  getVerificationKPIs: () => api.get('/analytics/verifications/kpis'),
};

export default analyticsService;
