import Joi from 'joi';

/**
 * Default validation schema for Qr.
 */
export const defaultQrSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultQrSchema,
};
