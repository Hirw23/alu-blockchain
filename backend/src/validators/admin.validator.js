import validate from '../middleware/validator.js';
import { defaultAdminSchema } from '../schemas/admin.schema.js';

/**
 * Default validator middleware for Admin requests.
 */
export const validateDefaultAdmin = validate(defaultAdminSchema, 'body');

export default {
  validateDefaultAdmin,
};
