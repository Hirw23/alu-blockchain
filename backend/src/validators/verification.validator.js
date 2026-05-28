import validate from '../middleware/validator.js';
import { defaultVerificationSchema } from '../schemas/verification.schema.js';

/**
 * Default validator middleware for Verification requests.
 */
export const validateDefaultVerification = validate(defaultVerificationSchema, 'body');

export default {
  validateDefaultVerification,
};
