import analyticsService from '../services/analytics.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Analytics.
 */
export const analyticsController = {
  /**
   * Endpoint returning all Analytics items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await analyticsService.getAll();
    res.status(200).json(successResponse('Fetched analytics items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Analytics item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await analyticsService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched analytics item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Analytics record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await analyticsService.create(req.body);
    res.status(201).json(successResponse('Created analytics item successfully', { item }));
  }),
};

export default analyticsController;
