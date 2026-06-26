import { recordEventParamsSchema, transactionLookupParamsSchema } from '../schemas/blockchain.schema.js';

// ============================================================
// Validation tests for blockchain Joi schemas
// ============================================================

const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Blockchain Schemas — Validation Tests', () => {
  describe('recordEventParamsSchema', () => {
    it('should pass for a valid UUID event ID', () => {
      const { error } = recordEventParamsSchema.validate({ eventId: validUUID });
      expect(error).toBeUndefined();
    });

    it('should fail when eventId is not a UUID', () => {
      const { error } = recordEventParamsSchema.validate({ eventId: 'evt-not-a-uuid' });
      expect(error).toBeDefined();
    });

    it('should fail when eventId is missing', () => {
      const { error } = recordEventParamsSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should fail for an empty string eventId', () => {
      const { error } = recordEventParamsSchema.validate({ eventId: '' });
      expect(error).toBeDefined();
    });
  });

  describe('transactionLookupParamsSchema', () => {
    it('should pass for a transaction ID within allowed length range', () => {
      const { error } = transactionLookupParamsSchema.validate({
        transactionId: 'tx-abc1234567890def',
      });
      expect(error).toBeUndefined();
    });

    it('should fail when transactionId is too short (< 10 chars)', () => {
      const { error } = transactionLookupParamsSchema.validate({ transactionId: 'short' });
      expect(error).toBeDefined();
    });

    it('should fail when transactionId exceeds 100 characters', () => {
      const { error } = transactionLookupParamsSchema.validate({
        transactionId: 'T'.repeat(101),
      });
      expect(error).toBeDefined();
    });

    it('should fail when transactionId is missing', () => {
      const { error } = transactionLookupParamsSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should pass for a realistic SHA-256 transaction hash (64 chars)', () => {
      const sha256hash = 'a'.repeat(64);
      const { error } = transactionLookupParamsSchema.validate({ transactionId: sha256hash });
      expect(error).toBeUndefined();
    });
  });
});
