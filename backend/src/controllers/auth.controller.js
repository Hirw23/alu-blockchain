import authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller class executing authentication request operations.
 */
export const authController = {
  /**
   * Registers a new entrepreneur or cooperative member.
   */
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json(successResponse('User registered successfully', { user }));
  }),

  /**
   * Logs a user in and returns token credentials.
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(successResponse('Login successful', result));
  }),
};

export default authController;
