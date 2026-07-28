import validate from '../middleware/validator.js';
import {
  recordEventParamsSchema,
  productParamsSchema,
  identityParamsSchema,
  transactionLookupParamsSchema,
} from '../schemas/blockchain.schema.js';

export const validateRecordEventParams = validate(recordEventParamsSchema, 'params');
export const validateProductParams = validate(productParamsSchema, 'params');
export const validateIdentityParams = validate(identityParamsSchema, 'params');
export const validateTransactionLookupParams = validate(transactionLookupParamsSchema, 'params');

export default {
  validateRecordEventParams,
  validateProductParams,
  validateIdentityParams,
  validateTransactionLookupParams,
};
