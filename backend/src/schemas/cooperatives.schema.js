import Joi from 'joi';

/**
 * Default validation schema for Cooperatives.
 */
export const defaultCooperativesSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultCooperativesSchema,
};
