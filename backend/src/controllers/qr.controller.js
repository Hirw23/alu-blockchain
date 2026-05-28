import qrService from '../services/qr.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Qr.
 */
export const qrController = {
  /**
   * Endpoint returning all Qr items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await qrService.getAll();
    res.status(200).json(successResponse('Fetched qr items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Qr item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await qrService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched qr item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Qr record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await qrService.create(req.body);
    res.status(201).json(successResponse('Created qr item successfully', { item }));
  }),
};

export default qrController;
