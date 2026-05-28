import Joi from 'joi';

/**
 * Validation schema for user registration.
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string()
    .valid('Entrepreneur', 'CooperativeAdmin', 'Buyer', 'FinancialInstitution', 'PlatformAdmin')
    .default('Entrepreneur'),
});

/**
 * Validation schema for user login.
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export default {
  registerSchema,
  loginSchema,
};
