import validate from '../middleware/validator.js';
import { defaultBlockchainSchema } from '../schemas/blockchain.schema.js';

/**
 * Default validator middleware for Blockchain requests.
 */
export const validateDefaultBlockchain = validate(defaultBlockchainSchema, 'body');

export default {
  validateDefaultBlockchain,
};
