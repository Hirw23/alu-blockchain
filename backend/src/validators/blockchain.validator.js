import validate from '../middleware/validator.js';
import {
  recordEventParamsSchema,
  transactionLookupParamsSchema,
} from '../schemas/blockchain.schema.js';

export const validateRecordEventParams = validate(recordEventParamsSchema, 'params');
export const validateTransactionLookupParams = validate(transactionLookupParamsSchema, 'params');

export default {
  validateRecordEventParams,
  validateTransactionLookupParams,
};
