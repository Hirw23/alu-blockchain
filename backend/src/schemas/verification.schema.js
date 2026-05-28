import Joi from 'joi';

/**
 * Default validation schema for Verification.
 */
export const defaultVerificationSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultVerificationSchema,
};
