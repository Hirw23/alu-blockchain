import Joi from 'joi';

/**
 * Validation schema for registering a new business.
 */
export const createBusinessSchema = Joi.object({
  businessName: Joi.string().required().messages({
    'any.required': 'Business name is required',
  }),
  tradingName: Joi.string().required().messages({
    'any.required': 'Trading name is required',
  }),
  description: Joi.string().optional().allow(''),
  businessType: Joi.string().required().messages({
    'any.required': 'Business type is required',
  }),
  industry: Joi.string().required().messages({
    'any.required': 'Industry is required',
  }),
  registrationNumber: Joi.string().required().messages({
    'any.required': 'Registration number is required',
  }),
  taxIdentificationNumber: Joi.string().required().messages({
    'any.required': 'Tax Identification Number is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid business email address',
    'any.required': 'Business email is required',
  }),
  phoneNumber: Joi.string().required().messages({
    'any.required': 'Business phone number is required',
  }),
  website: Joi.string().uri().optional().allow('').allow(null),
  logoUrl: Joi.string().uri().optional().allow('').allow(null),
  establishedDate: Joi.date().iso().optional().allow(null),
  cooperativeId: Joi.string().uuid().optional().allow(null),
});

/**
 * Validation schema for updating business information.
 */
export const updateBusinessSchema = Joi.object({
  businessName: Joi.string().optional(),
  tradingName: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  businessType: Joi.string().optional(),
  industry: Joi.string().optional(),
  registrationNumber: Joi.string().optional(),
  taxIdentificationNumber: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
  website: Joi.string().uri().optional().allow('').allow(null),
  logoUrl: Joi.string().uri().optional().allow('').allow(null),
  establishedDate: Joi.date().iso().optional().allow(null),
  cooperativeId: Joi.string().uuid().optional().allow(null),
});

/**
 * Validation schema for managing business addresses.
 */
export const addressSchema = Joi.object({
  country: Joi.string().required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  sector: Joi.string().required(),
  cell: Joi.string().required(),
  village: Joi.string().required(),
  postalCode: Joi.string().optional().allow('').allow(null),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
});

/**
 * Validation schema for document upload metadata.
 */
export const documentSchema = Joi.object({
  documentType: Joi.string()
    .valid('Registration Certificate', 'Tax Certificate', 'Business Permit', 'National ID', 'Other')
    .required(),
  fileName: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
});

/**
 * Validation schema for verifying a business document.
 */
export const verifyDocumentSchema = Joi.object({
  verificationStatus: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED').required(),
});

/**
 * Validation schema for member assignment.
 */
export const memberAssignmentSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  role: Joi.string().valid('Owner', 'Manager', 'Employee').required(),
});

/**
 * Validation schema for updating a member's role.
 */
export const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('Owner', 'Manager', 'Employee').required(),
});

/**
 * Validation schema for changing lifecycle status.
 */
export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'DRAFT',
      'SUBMITTED',
      'PENDING_VERIFICATION',
      'VERIFIED',
      'ACTIVE',
      'SUSPENDED',
      'ARCHIVED'
    )
    .required(),
});

/**
 * Validation schema for verification checks.
 */
export const verifyBusinessSchema = Joi.object({
  verificationStatus: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED').required(),
});

/**
 * Validation schema for filtering searches.
 */
export const searchBusinessSchema = Joi.object({
  q: Joi.string().optional().allow(''),
  registrationNumber: Joi.string().optional().allow(''),
  industry: Joi.string().optional().allow(''),
  businessType: Joi.string().optional().allow(''),
  verificationStatus: Joi.string().optional().allow(''),
  status: Joi.string().optional().allow(''),
  cooperativeId: Joi.string().uuid().optional().allow(''),
  ownerId: Joi.string().uuid().optional().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('businessName', 'tradingName', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export default {
  createBusinessSchema,
  updateBusinessSchema,
  addressSchema,
  documentSchema,
  verifyDocumentSchema,
  memberAssignmentSchema,
  updateMemberRoleSchema,
  updateStatusSchema,
  verifyBusinessSchema,
  searchBusinessSchema,
};
