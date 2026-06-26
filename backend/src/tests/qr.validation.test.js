import {
  createIdentitySchema,
  updateIdentityStatusSchema,
  generateQrSchema,
  bulkGenerateQrSchema,
  searchIdentitySchema,
} from '../schemas/qr.schema.js';

// ============================================================
// Validation tests for QR / Product Identity Joi schemas
// ============================================================

const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('QR Schemas — Validation Tests', () => {
  describe('createIdentitySchema', () => {
    it('should pass with no fields (all optional)', () => {
      const { error } = createIdentitySchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should pass with a future ISO expiry date', () => {
      const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      const { error } = createIdentitySchema.validate({ expiresAt: future });
      expect(error).toBeUndefined();
    });

    it('should fail when expiresAt is a past date', () => {
      const past = new Date(Date.now() - 1000).toISOString();
      const { error } = createIdentitySchema.validate({ expiresAt: past });
      expect(error).toBeDefined();
    });

    it('should pass when expiresAt is null (explicit opt-out)', () => {
      const { error } = createIdentitySchema.validate({ expiresAt: null });
      expect(error).toBeUndefined();
    });
  });

  describe('updateIdentityStatusSchema', () => {
    const validStatuses = ['GENERATED', 'ACTIVATED', 'PRINTED', 'ACTIVE', 'EXPIRED', 'REVOKED', 'ARCHIVED'];

    it.each(validStatuses)('should pass for status "%s"', (status) => {
      const { error } = updateIdentityStatusSchema.validate({ status });
      expect(error).toBeUndefined();
    });

    it('should fail for an unknown status value', () => {
      const { error } = updateIdentityStatusSchema.validate({ status: 'PENDING' });
      expect(error).toBeDefined();
    });

    it('should fail when status is missing', () => {
      const { error } = updateIdentityStatusSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('generateQrSchema', () => {
    it('should pass with valid format and imageSize', () => {
      const { error } = generateQrSchema.validate({ format: 'PNG', imageSize: 500 });
      expect(error).toBeUndefined();
    });

    it('should default format to PNG and imageSize to 300 when omitted', () => {
      const { value } = generateQrSchema.validate({});
      expect(value.format).toBe('PNG');
      expect(value.imageSize).toBe(300);
    });

    it('should fail for unsupported format', () => {
      const { error } = generateQrSchema.validate({ format: 'JPEG' });
      expect(error).toBeDefined();
    });

    it('should fail when imageSize is below minimum (100)', () => {
      const { error } = generateQrSchema.validate({ imageSize: 50 });
      expect(error).toBeDefined();
    });

    it('should fail when imageSize exceeds maximum (1000)', () => {
      const { error } = generateQrSchema.validate({ imageSize: 2000 });
      expect(error).toBeDefined();
    });
  });

  describe('bulkGenerateQrSchema', () => {
    it('should pass with at least one valid UUID in productIds', () => {
      const { error } = bulkGenerateQrSchema.validate({ productIds: [validUUID] });
      expect(error).toBeUndefined();
    });

    it('should fail when productIds is empty', () => {
      const { error } = bulkGenerateQrSchema.validate({ productIds: [] });
      expect(error).toBeDefined();
    });

    it('should fail when a productId is not a valid UUID', () => {
      const { error } = bulkGenerateQrSchema.validate({ productIds: ['not-a-uuid'] });
      expect(error).toBeDefined();
    });

    it('should fail when productIds is missing', () => {
      const { error } = bulkGenerateQrSchema.validate({ format: 'PNG' });
      expect(error).toBeDefined();
    });
  });

  describe('searchIdentitySchema', () => {
    it('should pass with no fields (all optional)', () => {
      const { error } = searchIdentitySchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should fail for invalid qrStatus value', () => {
      const { error } = searchIdentitySchema.validate({ qrStatus: 'DELETED' });
      expect(error).toBeDefined();
    });

    it('should default page to 1 and limit to 10', () => {
      const { value } = searchIdentitySchema.validate({});
      expect(value.page).toBe(1);
      expect(value.limit).toBe(10);
    });

    it('should fail when limit exceeds 100', () => {
      const { error } = searchIdentitySchema.validate({ limit: 200 });
      expect(error).toBeDefined();
    });
  });
});
