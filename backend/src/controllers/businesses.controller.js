import businessesService from '../services/businesses.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Businesses.
 */
export const businessesController = {
  /**
   * Endpoint returning all Businesses items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await businessesService.getAll();
    res.status(200).json(successResponse('Fetched businesses items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Businesses item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await businessesService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched businesses item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Businesses record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await businessesService.create(req.body);
    res.status(201).json(successResponse('Created businesses item successfully', { item }));
  }),
};

export default businessesController;
