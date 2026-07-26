import authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const authController = {
  /**
   * Registers a new Entrepreneur.
   */
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json(successResponse('User registered successfully', { user }));
  }),

  /**
   * Verifies email registration via token.
   */
  verifyEmail: asyncHandler(async (req, res) => {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.status(200).json(successResponse(result.message));
  }),

  /**
   * Performs credentials verification and issues tokens.
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(successResponse('Login successful', result));
  }),

  /**
   * Logs out user and invalidates refresh token.
   */
  logout: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.status(200).json(successResponse(result.message));
  }),

  /**
   * Issues new access & refresh tokens.
   */
  refresh: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json(successResponse('Tokens refreshed successfully', result));
  }),

  /**
   * Generates a password reset token.
   */
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(successResponse(result.message, { resetToken: result.resetToken }));
  }),

  /**
   * Resets password using token.
   */
  resetPassword: asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json(successResponse(result.message));
  }),

  /**
   * Modifies password of authenticated user.
   */
  changePassword: asyncHandler(async (req, res) => {
    const result = await authService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.status(200).json(successResponse(result.message));
  }),

  /**
   * Retrieves profile details of authenticated caller.
   */
  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.status(200).json(successResponse('Profile details retrieved successfully', { user }));
  }),

  /**
   * Modifies profile details of authenticated caller.
   */
  updateProfile: asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(successResponse('Profile updated successfully', { user }));
  }),
};

export default authController;
