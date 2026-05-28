import validate from '../middleware/validator.js';
import { defaultSupplychainSchema } from '../schemas/supplychain.schema.js';

/**
 * Default validator middleware for Supplychain requests.
 */
export const validateDefaultSupplychain = validate(defaultSupplychainSchema, 'body');

export default {
  validateDefaultSupplychain,
};
