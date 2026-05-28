import blockchainService from '../services/blockchain.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Blockchain.
 */
export const blockchainController = {
  /**
   * Endpoint returning all Blockchain items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await blockchainService.getAll();
    res.status(200).json(successResponse('Fetched blockchain items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Blockchain item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await blockchainService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched blockchain item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Blockchain record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await blockchainService.create(req.body);
    res.status(201).json(successResponse('Created blockchain item successfully', { item }));
  }),
};

export default blockchainController;
