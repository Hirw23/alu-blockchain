import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateUpdateProfile,
  validateRefreshToken,
} from '../validators/auth.validator.js';

const router = Router();

// Public auth endpoints
router.post('/register', validateRegister, authController.register);
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', validateRefreshToken, authController.refresh);
router.post('/logout', validateRefreshToken, authController.logout);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// Protected auth endpoints
router.get('/me', authenticate, authController.me);
router.post(
  '/change-password',
  authenticate,
  validateChangePassword,
  authController.changePassword
);
router.patch('/profile', authenticate, validateUpdateProfile, authController.updateProfile);

export default router;
