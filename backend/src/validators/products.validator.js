import validate from '../middleware/validator.js';
import {
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
} from '../schemas/products.schema.js';

export const validateCreateProduct = validate(createProductSchema, 'body');
export const validateUpdateProduct = validate(updateProductSchema, 'body');
export const validateCreateCategory = validate(createCategorySchema, 'body');
export const validateUpdateCategory = validate(updateCategorySchema, 'body');
export const validateCreateVariant = validate(createVariantSchema, 'body');
export const validateUpdateVariant = validate(updateVariantSchema, 'body');
export const validateImageMetadata = validate(imageMetadataSchema, 'body');
export const validateProductDocument = validate(productDocumentSchema, 'body');
export const validateUpdateInventory = validate(updateInventorySchema, 'body');
export const validateUpdateProductStatus = validate(updateProductStatusSchema, 'body');
export const validateSearchProduct = validate(searchProductSchema, 'query');

export default {
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateVariant,
  validateUpdateVariant,
  validateImageMetadata,
  validateProductDocument,
  validateUpdateInventory,
  validateUpdateProductStatus,
  validateSearchProduct,
};
