import analyticsService from '../services/analytics.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const analyticsController = {
  getDashboard: asyncHandler(async (req, res) => {
    const data = await analyticsService.getDashboard(
      req.user.id,
      req.user.role,
      req.query.dashboardType
    );
    res.status(200).json(successResponse('Dashboard analytics loaded', data));
  }),

  getBusinessKPIs: asyncHandler(async (req, res) => {
    const kpis = await analyticsService.getBusinessKPIs(req.params.id, req.user.id, req.user.role);
    res.status(200).json(successResponse('Business KPI metrics retrieved', { kpis }));
  }),

  getProductKPIs: asyncHandler(async (req, res) => {
    const kpis = await analyticsService.getProductKPIs(req.params.id);
    res.status(200).json(successResponse('Product KPI metrics retrieved', { kpis }));
  }),

  getGeographicStats: asyncHandler(async (req, res) => {
    const geography = await analyticsService.getGeographicStats();
    res.status(200).json(successResponse('Geographic scan statistics', { geography }));
  }),

  getTrends: asyncHandler(async (req, res) => {
    const trends = await analyticsService.getTrends({ ...req.query, businessId: req.params.id });
    res.status(200).json(successResponse('Verification trends calculations', { trends }));
  }),

  compareProducts: asyncHandler(async (req, res) => {
    // Parse targetIds query parameter
    const ids = Array.isArray(req.query.targetIds) ? req.query.targetIds : [req.query.targetIds];

    const comparison = await analyticsService.compareProducts(ids);
    res.status(200).json(successResponse('Product comparison analysis results', { comparison }));
  }),
};

export default analyticsController;
