import Joi from 'joi';

export const createIdentitySchema = Joi.object({
  expiresAt: Joi.date().iso().greater('now').optional().allow(null),
});

export const updateIdentityStatusSchema = Joi.object({
  status: Joi.string()
    .valid('GENERATED', 'ACTIVATED', 'PRINTED', 'ACTIVE', 'EXPIRED', 'REVOKED', 'ARCHIVED')
    .required(),
});

export const generateQrSchema = Joi.object({
  format: Joi.string().valid('PNG', 'SVG', 'PDF').default('PNG'),
  imageSize: Joi.number().integer().min(100).max(1000).default(300),
});

export const bulkGenerateQrSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  format: Joi.string().valid('PNG', 'SVG', 'PDF').default('PNG'),
});

export const searchIdentitySchema = Joi.object({
  q: Joi.string().optional().allow(''),
  qrStatus: Joi.string()
    .valid('GENERATED', 'ACTIVATED', 'PRINTED', 'ACTIVE', 'EXPIRED', 'REVOKED', 'ARCHIVED')
    .optional(),
  verificationStatus: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('createdAt', 'lastScanAt', 'totalScans').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export default {
  createIdentitySchema,
  updateIdentityStatusSchema,
  generateQrSchema,
  bulkGenerateQrSchema,
  searchIdentitySchema,
};
