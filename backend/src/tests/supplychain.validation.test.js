import { createEventSchema, updateEventSchema, postCommentSchema, locationSchema, attachmentSchema } from '../schemas/supplychain.schema.js';

// ============================================================
// Validation tests for supplychain Joi schemas
// ============================================================

const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('SupplyChain Schemas — Validation Tests', () => {
  describe('createEventSchema', () => {
    const valid = {
      productId: validUUID,
      eventTypeId: validUUID,
      title: 'Morning Harvest Logs',
    };

    it('should pass for a valid event payload', () => {
      const { error } = createEventSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when productId is not a UUID', () => {
      const { error } = createEventSchema.validate({ ...valid, productId: 'not-uuid' });
      expect(error).toBeDefined();
    });

    it('should fail when title is too short (< 3 characters)', () => {
      const { error } = createEventSchema.validate({ ...valid, title: 'AB' });
      expect(error).toBeDefined();
    });

    it('should fail when title is too long (> 100 characters)', () => {
      const { error } = createEventSchema.validate({ ...valid, title: 'A'.repeat(101) });
      expect(error).toBeDefined();
    });

    it('should fail when description exceeds 500 characters', () => {
      const { error } = createEventSchema.validate({ ...valid, description: 'D'.repeat(501) });
      expect(error).toBeDefined();
    });

    it('should accept optional location block', () => {
      const { error } = createEventSchema.validate({
        ...valid,
        location: {
          country: 'Rwanda',
          province: 'Kigali',
          district: 'Gasabo',
          sector: 'Kimironko',
          cell: 'Bibare',
          village: 'Nyabisindu',
        },
      });
      expect(error).toBeUndefined();
    });
  });

  describe('updateEventSchema', () => {
    it('should pass with partial update fields', () => {
      const { error } = updateEventSchema.validate({ title: 'Updated Harvest Logs' });
      expect(error).toBeUndefined();
    });

    it('should pass with empty payload (all optional)', () => {
      const { error } = updateEventSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should fail when title is shorter than 3 characters', () => {
      const { error } = updateEventSchema.validate({ title: 'AB' });
      expect(error).toBeDefined();
    });
  });

  describe('postCommentSchema', () => {
    it('should pass for a valid comment text', () => {
      const { error } = postCommentSchema.validate({ comment: 'Checked and confirmed good quality.' });
      expect(error).toBeUndefined();
    });

    it('should fail for an empty comment string', () => {
      const { error } = postCommentSchema.validate({ comment: '' });
      expect(error).toBeDefined();
    });

    it('should fail when comment exceeds 1000 characters', () => {
      const { error } = postCommentSchema.validate({ comment: 'X'.repeat(1001) });
      expect(error).toBeDefined();
    });
  });

  describe('locationSchema', () => {
    it('should fail when a required field is missing', () => {
      const { error } = locationSchema.validate({ country: 'Rwanda', province: 'Kigali' });
      expect(error).toBeDefined();
    });

    it('should fail for latitude out of -90 to 90 range', () => {
      const { error } = locationSchema.validate({
        country: 'Rwanda', province: 'Kigali', district: 'Gasabo',
        sector: 'K', cell: 'B', village: 'N', latitude: -100,
      });
      expect(error).toBeDefined();
    });
  });

  describe('attachmentSchema', () => {
    it('should pass for a valid attachment', () => {
      const { error } = attachmentSchema.validate({
        fileName: 'receipt.pdf',
        fileUrl: 'https://cdn.example.com/receipt.pdf',
        documentType: 'Receipt',
      });
      expect(error).toBeUndefined();
    });

    it('should fail for unknown document type', () => {
      const { error } = attachmentSchema.validate({
        fileName: 'test.pdf',
        fileUrl: 'https://cdn.example.com/test.pdf',
        documentType: 'Invoice',
      });
      expect(error).toBeDefined();
    });
  });
});
