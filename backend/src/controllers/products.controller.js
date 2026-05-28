import productsService from '../services/products.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Products.
 */
export const productsController = {
  /**
   * Endpoint returning all Products items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await productsService.getAll();
    res.status(200).json(successResponse('Fetched products items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Products item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await productsService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched products item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Products record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await productsService.create(req.body);
    res.status(201).json(successResponse('Created products item successfully', { item }));
  }),
};

export default productsController;
