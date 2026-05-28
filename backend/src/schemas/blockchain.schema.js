import Joi from 'joi';

/**
 * Default validation schema for Blockchain.
 */
export const defaultBlockchainSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultBlockchainSchema,
};
