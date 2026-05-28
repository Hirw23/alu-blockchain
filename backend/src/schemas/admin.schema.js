import Joi from 'joi';

/**
 * Default validation schema for Admin.
 */
export const defaultAdminSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultAdminSchema,
};
