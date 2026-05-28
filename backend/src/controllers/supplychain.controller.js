import supplychainService from '../services/supplychain.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Supplychain.
 */
export const supplychainController = {
  /**
   * Endpoint returning all Supplychain items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await supplychainService.getAll();
    res.status(200).json(successResponse('Fetched supplychain items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Supplychain item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await supplychainService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched supplychain item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Supplychain record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await supplychainService.create(req.body);
    res.status(201).json(successResponse('Created supplychain item successfully', { item }));
  }),
};

export default supplychainController;
