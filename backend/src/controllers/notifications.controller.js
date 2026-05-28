import notificationsService from '../services/notifications.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller exposing standard REST handler methods for Notifications.
 */
export const notificationsController = {
  /**
   * Endpoint returning all Notifications items.
   */
  getAll: asyncHandler(async (req, res) => {
    const items = await notificationsService.getAll();
    res.status(200).json(successResponse('Fetched notifications items successfully', { items }));
  }),

  /**
   * Endpoint returning a specific Notifications item by its ID.
   */
  getById: asyncHandler(async (req, res) => {
    const item = await notificationsService.getById(req.params.id);
    res.status(200).json(successResponse('Fetched notifications item successfully', { item }));
  }),

  /**
   * Endpoint registering/creating a new Notifications record.
   */
  create: asyncHandler(async (req, res) => {
    const item = await notificationsService.create(req.body);
    res.status(201).json(successResponse('Created notifications item successfully', { item }));
  }),
};

export default notificationsController;
