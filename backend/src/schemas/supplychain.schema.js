import Joi from 'joi';

export const locationSchema = Joi.object({
  country: Joi.string().required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  sector: Joi.string().required(),
  cell: Joi.string().required(),
  village: Joi.string().required(),
  address: Joi.string().optional().allow('').allow(null),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
});

export const attachmentSchema = Joi.object({
  fileName: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
  documentType: Joi.string()
    .valid('Image', 'PDF', 'Certificate', 'Delivery Note', 'Receipt', 'Inspection Report', 'Other')
    .required(),
});

// Used by the single-file upload endpoint (POST /events/:id/attachments); fileName/fileUrl
// are derived server-side from the uploaded file rather than supplied by the client.
export const attachmentUploadSchema = Joi.object({
  documentType: Joi.string()
    .valid('Image', 'PDF', 'Certificate', 'Delivery Note', 'Receipt', 'Inspection Report', 'Other')
    .required(),
});

export const createEventSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  eventTypeId: Joi.string().uuid().required(),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional().allow('').allow(null),
  occurredAt: Joi.date().iso().optional(),
  location: locationSchema.optional(),
  attachments: Joi.array().items(attachmentSchema).optional(),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional().allow('').allow(null),
  occurredAt: Joi.date().iso().optional(),
});

export const updateEventStatusSchema = Joi.object({
  status: Joi.string().valid('DRAFT', 'SUBMITTED', 'CONFIRMED', 'LOCKED').required(),
});

export const postCommentSchema = Joi.object({
  comment: Joi.string().min(1).max(1000).required(),
});

export const searchEventSchema = Joi.object({
  q: Joi.string().optional().allow(''),
  productId: Joi.string().uuid().optional(),
  businessId: Joi.string().uuid().optional(),
  eventTypeId: Joi.string().uuid().optional(),
  eventStatus: Joi.string().valid('DRAFT', 'SUBMITTED', 'CONFIRMED', 'LOCKED').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('occurredAt', 'createdAt', 'sequenceNumber').default('occurredAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export default {
  locationSchema,
  attachmentSchema,
  attachmentUploadSchema,
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  postCommentSchema,
  searchEventSchema,
};
