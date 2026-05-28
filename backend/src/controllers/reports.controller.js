import reportsService from '../services/reports.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Reports.
 */
export const reportsController = {
  /**
   * Endpoint returning all Reports items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await reportsService.getAll();
    res.status(200).json(successResponse('Fetched reports items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Reports item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await reportsService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched reports item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Reports record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await reportsService.create(req.body);
    res.status(201).json(successResponse('Created reports item successfully', { item }));
  }),
};

export default reportsController;
