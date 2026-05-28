import usersService from '../services/users.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller executing endpoints associated with active users.
 */
export const usersController = {
  /**
   * Retrieves profile details of the authenticated caller.
   */
  getProfile: asyncHandler(async (req, res) => {
    // req.user is set by authenticate middleware placeholder
    const user = await usersService.getProfile(req.user.id);
    res.status(200).json(successResponse('User profile retrieved successfully', { user }));
  }),

  /**
   * Updates the profile of the authenticated caller.
   */
  updateProfile: asyncHandler(async (req, res) => {
    const user = await usersService.updateProfile(req.user.id, req.body);
    res.status(200).json(successResponse('User profile updated successfully', { user }));
  }),
};

export default usersController;
