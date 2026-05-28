import Joi from 'joi';

/**
 * Default validation schema for Analytics.
 */
export const defaultAnalyticsSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultAnalyticsSchema,
};
