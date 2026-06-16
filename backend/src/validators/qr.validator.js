import validate from '../middleware/validator.js';
import {
  createIdentitySchema,
  updateIdentityStatusSchema,
  generateQrSchema,
  bulkGenerateQrSchema,
  searchIdentitySchema,
} from '../schemas/qr.schema.js';

export const validateCreateIdentity = validate(createIdentitySchema, 'body');
export const validateUpdateIdentityStatus = validate(updateIdentityStatusSchema, 'body');
export const validateGenerateQr = validate(generateQrSchema, 'body');
export const validateBulkGenerateQr = validate(bulkGenerateQrSchema, 'body');
export const validateSearchIdentity = validate(searchIdentitySchema, 'query');

export default {
  validateCreateIdentity,
  validateUpdateIdentityStatus,
  validateGenerateQr,
  validateBulkGenerateQr,
  validateSearchIdentity,
};
