import Joi from 'joi';

/**
 * Default validation schema for Products.
 */
export const defaultProductsSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultProductsSchema,
};
