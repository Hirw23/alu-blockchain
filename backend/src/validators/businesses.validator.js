import validate from '../middleware/validator.js';
import {
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
} from '../schemas/businesses.schema.js';

export const validateCreateBusiness = validate(createBusinessSchema, 'body');
export const validateUpdateBusiness = validate(updateBusinessSchema, 'body');
export const validateAddress = validate(addressSchema, 'body');
export const validateDocument = validate(documentSchema, 'body');
export const validateVerifyDocument = validate(verifyDocumentSchema, 'body');
export const validateMemberAssignment = validate(memberAssignmentSchema, 'body');
export const validateUpdateMemberRole = validate(updateMemberRoleSchema, 'body');
export const validateUpdateStatus = validate(updateStatusSchema, 'body');
export const validateVerifyBusiness = validate(verifyBusinessSchema, 'body');
export const validateSearchBusiness = validate(searchBusinessSchema, 'query');

export default {
  validateCreateBusiness,
  validateUpdateBusiness,
  validateAddress,
  validateDocument,
  validateVerifyDocument,
  validateMemberAssignment,
  validateUpdateMemberRole,
  validateUpdateStatus,
  validateVerifyBusiness,
  validateSearchBusiness,
};
