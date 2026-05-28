import adminService from '../services/admin.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Admin.
 */
export const adminController = {
  /**
   * Endpoint returning all Admin items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await adminService.getAll();
    res.status(200).json(successResponse('Fetched admin items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Admin item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await adminService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched admin item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Admin record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await adminService.create(req.body);
    res.status(201).json(successResponse('Created admin item successfully', { item }));
  }),
};

export default adminController;
