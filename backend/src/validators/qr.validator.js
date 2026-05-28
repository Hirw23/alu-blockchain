import validate from '../middleware/validator.js';
import { defaultQrSchema } from '../schemas/qr.schema.js';

/**
 * Default validator middleware for Qr requests.
 */
export const validateDefaultQr = validate(defaultQrSchema, 'body');

export default {
  validateDefaultQr,
};
