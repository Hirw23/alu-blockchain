import Joi from 'joi';

export const recordEventParamsSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
});

export const transactionLookupParamsSchema = Joi.object({
  transactionId: Joi.string().min(10).max(100).required(),
});

export default {
  recordEventParamsSchema,
  transactionLookupParamsSchema,
};
