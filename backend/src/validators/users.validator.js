import validate from '../middleware/validator.js';
import { updateProfileSchema } from '../schemas/users.schema.js';

/**
 * Validation middleware for user profile updates.
 */
export const validateUpdateProfile = validate(updateProfileSchema, 'body');

export default {
  validateUpdateProfile,
};
