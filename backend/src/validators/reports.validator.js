import validate from '../middleware/validator.js';
import { defaultReportsSchema } from '../schemas/reports.schema.js';

/**
 * Default validator middleware for Reports requests.
 */
export const validateDefaultReports = validate(defaultReportsSchema, 'body');

export default {
  validateDefaultReports,
};
