import validate from '../middleware/validator.js';
import { defaultAnalyticsSchema } from '../schemas/analytics.schema.js';

/**
 * Default validator middleware for Analytics requests.
 */
export const validateDefaultAnalytics = validate(defaultAnalyticsSchema, 'body');

export default {
  validateDefaultAnalytics,
};
