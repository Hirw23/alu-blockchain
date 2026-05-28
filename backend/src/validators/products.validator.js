import validate from '../middleware/validator.js';
import { defaultProductsSchema } from '../schemas/products.schema.js';

/**
 * Default validator middleware for Products requests.
 */
export const validateDefaultProducts = validate(defaultProductsSchema, 'body');

export default {
  validateDefaultProducts,
};
