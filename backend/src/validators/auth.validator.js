import validate from '../middleware/validator.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

/**
 * Validation middleware for authentication routes.
 */
export const validateRegister = validate(registerSchema, 'body');
export const validateLogin = validate(loginSchema, 'body');

export default {
  validateRegister,
  validateLogin,
};
