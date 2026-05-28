import Joi from 'joi';

/**
 * Default validation schema for Supplychain.
 */
export const defaultSupplychainSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultSupplychainSchema,
};
