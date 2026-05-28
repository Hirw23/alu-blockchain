import Joi from 'joi';

/**
 * Validation schema for updating user profile.
 */
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
});

export default {
  updateProfileSchema,
};
