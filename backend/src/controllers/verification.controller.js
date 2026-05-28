import verificationService from '../services/verification.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Verification.
 */
export const verificationController = {
  /**
   * Endpoint returning all Verification items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await verificationService.getAll();
    res.status(200).json(successResponse('Fetched verification items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Verification item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await verificationService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched verification item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Verification record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await verificationService.create(req.body);
    res.status(201).json(successResponse('Created verification item successfully', { item }));
  }),
};

export default verificationController;
