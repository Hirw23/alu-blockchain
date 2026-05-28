import Joi from 'joi';

/**
 * Default validation schema for Businesses.
 */
export const defaultBusinessesSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultBusinessesSchema,
};
