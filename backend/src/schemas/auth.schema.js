import Joi from 'joi';

/**
 * Password strength criteria
 */
const passwordValidation = Joi.string().min(6).required().messages({
  'string.min': 'Password must be at least 6 characters long',
  'any.required': 'Password is required',
});

/**
 * Validation schema for user registration.
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: passwordValidation,
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required',
  }),
  phoneNumber: Joi.string().optional(),
  profileImage: Joi.string().uri().optional(),
});

/**
 * Validation schema for user login.
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

/**
 * Validation schema for email verification.
 */
export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required',
  }),
});

/**
 * Validation schema for forgot password request.
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
});

/**
 * Validation schema for resetting password using token.
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  password: passwordValidation,
});

/**
 * Validation schema for authenticated password updates.
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: passwordValidation,
  newPasswordConfirmation: Joi.any().equal(Joi.ref('newPassword')).required().messages({
    'any.only': 'New password confirmation does not match new password',
    'any.required': 'New password confirmation is required',
  }),
});

/**
 * Validation schema for profile modifications.
 */
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  profileImage: Joi.string().uri().optional(),
  profileDetails: Joi.string().optional(),
});

/**
 * Validation schema for access token refreshing.
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

export default {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  refreshTokenSchema,
};
