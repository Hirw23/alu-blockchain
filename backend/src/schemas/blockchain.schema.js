import Joi from 'joi';

export const recordEventParamsSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
});

export const productParamsSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});

export const identityParamsSchema = Joi.object({
  identityId: Joi.string().uuid().required(),
});

export const transactionLookupParamsSchema = Joi.object({
  transactionId: Joi.string().min(10).max(100).required(),
});

export default {
  recordEventParamsSchema,
  productParamsSchema,
  identityParamsSchema,
  transactionLookupParamsSchema,
};
