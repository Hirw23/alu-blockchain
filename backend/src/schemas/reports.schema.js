import Joi from 'joi';

/**
 * Default validation schema for Reports.
 */
export const defaultReportsSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultReportsSchema,
};
