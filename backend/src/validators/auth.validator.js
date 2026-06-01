import validate from '../middleware/validator.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  refreshTokenSchema,
} from '../schemas/auth.schema.js';

export const validateRegister = validate(registerSchema, 'body');
export const validateLogin = validate(loginSchema, 'body');
export const validateVerifyEmail = validate(verifyEmailSchema, 'body');
export const validateForgotPassword = validate(forgotPasswordSchema, 'body');
export const validateResetPassword = validate(resetPasswordSchema, 'body');
export const validateChangePassword = validate(changePasswordSchema, 'body');
export const validateUpdateProfile = validate(updateProfileSchema, 'body');
export const validateRefreshToken = validate(refreshTokenSchema, 'body');

export default {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateUpdateProfile,
  validateRefreshToken,
};
