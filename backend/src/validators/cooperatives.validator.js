import validate from '../middleware/validator.js';
import { defaultCooperativesSchema } from '../schemas/cooperatives.schema.js';

/**
 * Default validator middleware for Cooperatives requests.
 */
export const validateDefaultCooperatives = validate(defaultCooperativesSchema, 'body');

export default {
  validateDefaultCooperatives,
};
