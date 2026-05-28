import cooperativesService from '../services/cooperatives.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Cooperatives.
 */
export const cooperativesController = {
  /**
   * Endpoint returning all Cooperatives items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await cooperativesService.getAll();
    res.status(200).json(successResponse('Fetched cooperatives items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Cooperatives item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await cooperativesService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched cooperatives item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Cooperatives record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await cooperativesService.create(req.body);
    res.status(201).json(successResponse('Created cooperatives item successfully', { item }));
  }),
};

export default cooperativesController;
