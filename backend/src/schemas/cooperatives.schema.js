import Joi from 'joi';

/**
 * Validation schema for registering a cooperative.
 */
export const createCooperativeSchema = Joi.object({
  cooperativeName: Joi.string().required().messages({
    'any.required': 'Cooperative name is required',
  }),
  description: Joi.string().optional().allow(''),
  registrationNumber: Joi.string().required().messages({
    'any.required': 'Registration number is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Cooperative email is required',
  }),
  phoneNumber: Joi.string().required().messages({
    'any.required': 'Cooperative phone number is required',
  }),
});

/**
 * Validation schema for updating cooperative details.
 */
export const updateCooperativeSchema = Joi.object({
  cooperativeName: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
  status: Joi.string().valid('ACTIVE', 'SUSPENDED').optional(),
});

/**
 * Validation schema for binding businesses to a cooperative.
 */
export const bindBusinessSchema = Joi.object({
  businessId: Joi.string().uuid().required().messages({
    'any.required': 'Business ID is required',
  }),
});

export default {
  createCooperativeSchema,
  updateCooperativeSchema,
  bindBusinessSchema,
};
