import Joi from 'joi';

/**
 * Validation schema for registering a new product.
 */
export const createProductSchema = Joi.object({
  businessId: Joi.string().uuid().required(),
  categoryId: Joi.string().uuid().required(),
  productName: Joi.string().required(),
  productCode: Joi.string().required(),
  sku: Joi.string().required(),
  barcode: Joi.string().required(),
  description: Joi.string().optional().allow('').allow(null),
  productType: Joi.string().required(),
  batchNumber: Joi.string().optional().allow('').allow(null),
  countryOfOrigin: Joi.string().required(),
  productionFacility: Joi.string().optional().allow('').allow(null),
  manufacturingDate: Joi.date().iso().optional().allow(null),
  expiryDate: Joi.date().iso().optional().allow(null),
  quantity: Joi.number().min(0).default(0),
  unitOfMeasure: Joi.string().required(),
  storageRequirements: Joi.string().optional().allow('').allow(null),
});

/**
 * Validation schema for modifying product properties.
 */
export const updateProductSchema = Joi.object({
  categoryId: Joi.string().uuid().optional(),
  productName: Joi.string().optional(),
  productCode: Joi.string().optional(),
  sku: Joi.string().optional(),
  barcode: Joi.string().optional(),
  description: Joi.string().optional().allow('').allow(null),
  productType: Joi.string().optional(),
  batchNumber: Joi.string().optional().allow('').allow(null),
  countryOfOrigin: Joi.string().optional(),
  productionFacility: Joi.string().optional().allow('').allow(null),
  manufacturingDate: Joi.date().iso().optional().allow(null),
  expiryDate: Joi.date().iso().optional().allow(null),
  quantity: Joi.number().min(0).optional(),
  unitOfMeasure: Joi.string().optional(),
  storageRequirements: Joi.string().optional().allow('').allow(null),
});

/**
 * Validation schema for creating a product category.
 */
export const createCategorySchema = Joi.object({
  businessId: Joi.string().uuid().optional().allow(null),
  categoryName: Joi.string().required(),
  description: Joi.string().optional().allow('').allow(null),
  parentCategoryId: Joi.string().uuid().optional().allow(null),
});

/**
 * Validation schema for modifying a category.
 */
export const updateCategorySchema = Joi.object({
  categoryName: Joi.string().optional(),
  description: Joi.string().optional().allow('').allow(null),
  parentCategoryId: Joi.string().uuid().optional().allow(null),
});

/**
 * Validation schema for creating a product variant.
 */
export const createVariantSchema = Joi.object({
  variantName: Joi.string().required(),
  sku: Joi.string().required(),
  barcode: Joi.string().required(),
  quantity: Joi.number().min(0).default(0),
  unitOfMeasure: Joi.string().required(),
});

/**
 * Validation schema for updating a product variant.
 */
export const updateVariantSchema = Joi.object({
  variantName: Joi.string().optional(),
  sku: Joi.string().optional(),
  barcode: Joi.string().optional(),
  quantity: Joi.number().min(0).optional(),
  unitOfMeasure: Joi.string().optional(),
});

/**
 * Validation schema for image upload metadata.
 */
export const imageMetadataSchema = Joi.object({
  fileName: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
  displayOrder: Joi.number().integer().min(0).default(0),
});

/**
 * Validation schema for document upload metadata.
 */
export const productDocumentSchema = Joi.object({
  documentType: Joi.string()
    .valid('Certificate', 'Product Label', 'Safety Sheet', 'Manufacturing Certificate', 'Other')
    .required(),
  fileName: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
});

/**
 * Validation schema for lightweight inventory metadata updates.
 */
export const updateInventorySchema = Joi.object({
  quantity: Joi.number().min(0).required(),
  unitOfMeasure: Joi.string().required(),
  storageRequirements: Joi.string().optional().allow('').allow(null),
});

/**
 * Validation schema for changing lifecycle status.
 */
export const updateProductStatusSchema = Joi.object({
  status: Joi.string()
    .valid('DRAFT', 'REGISTERED', 'VERIFIED', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED', 'ARCHIVED')
    .required(),
});

/**
 * Validation schema for product query searches.
 */
export const searchProductSchema = Joi.object({
  q: Joi.string().optional().allow(''),
  productCode: Joi.string().optional().allow(''),
  sku: Joi.string().optional().allow(''),
  barcode: Joi.string().optional().allow(''),
  categoryId: Joi.string().uuid().optional().allow(''),
  businessId: Joi.string().uuid().optional().allow(''),
  batchNumber: Joi.string().optional().allow(''),
  status: Joi.string().optional().allow(''),
  verificationStatus: Joi.string().optional().allow(''),
  manufacturingDate: Joi.date().iso().optional(),
  expiryDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('productName', 'productCode', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export default {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  createVariantSchema,
  updateVariantSchema,
  imageMetadataSchema,
  productDocumentSchema,
  updateInventorySchema,
  updateProductStatusSchema,
  searchProductSchema,
};
