import validate from '../middleware/validator.js';
import { defaultBusinessesSchema } from '../schemas/businesses.schema.js';

/**
 * Default validator middleware for Businesses requests.
 */
export const validateDefaultBusinesses = validate(defaultBusinessesSchema, 'body');

export default {
  validateDefaultBusinesses,
};
