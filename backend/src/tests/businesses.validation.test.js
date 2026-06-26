import {
  createBusinessSchema,
  addressSchema,
  memberAssignmentSchema,
  verifyBusinessSchema,
  documentSchema,
} from '../schemas/businesses.schema.js';

// ============================================================
// Validation tests for businesses Joi schemas
// ============================================================

describe('Businesses Schemas — Validation Tests', () => {
  describe('createBusinessSchema', () => {
    const valid = {
      businessName: 'Mamma Honey Ltd',
      tradingName: 'Mamma Honey',
      businessType: 'Retail',
      industry: 'Agriculture',
      registrationNumber: 'RC123456',
      taxIdentificationNumber: 'TIN987654',
      email: 'info@mammahoney.com',
      phoneNumber: '+250788123456',
    };

    it('should pass for a fully valid payload', () => {
      const { error } = createBusinessSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when businessName is missing', () => {
      const { error } = createBusinessSchema.validate({ ...valid, businessName: undefined });
      expect(error).toBeDefined();
    });

    it('should fail when email is malformed', () => {
      const { error } = createBusinessSchema.validate({ ...valid, email: 'bad-email' });
      expect(error).toBeDefined();
    });

    it('should fail when website is not a valid URI', () => {
      const { error } = createBusinessSchema.validate({ ...valid, website: 'not-a-url' });
      expect(error).toBeDefined();
    });

    it('should pass when optional website is omitted', () => {
      const { error } = createBusinessSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when cooperativeId is not a UUID', () => {
      const { error } = createBusinessSchema.validate({ ...valid, cooperativeId: 'not-a-uuid' });
      expect(error).toBeDefined();
    });
  });

  describe('addressSchema', () => {
    const valid = {
      country: 'Rwanda',
      province: 'Kigali',
      district: 'Gasabo',
      sector: 'Kimironko',
      cell: 'Bibare',
      village: 'Nyabisindu',
    };

    it('should pass for valid address', () => {
      const { error } = addressSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when country is missing', () => {
      const { error } = addressSchema.validate({ ...valid, country: undefined });
      expect(error).toBeDefined();
    });

    it('should fail for out-of-range latitude', () => {
      const { error } = addressSchema.validate({ ...valid, latitude: 200 });
      expect(error).toBeDefined();
    });
  });

  describe('memberAssignmentSchema', () => {
    it('should pass with valid UUID and allowed role', () => {
      const { error } = memberAssignmentSchema.validate({
        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        role: 'Manager',
      });
      expect(error).toBeUndefined();
    });

    it('should fail with invalid role', () => {
      const { error } = memberAssignmentSchema.validate({
        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        role: 'Director',
      });
      expect(error).toBeDefined();
    });

    it('should fail with non-UUID userId', () => {
      const { error } = memberAssignmentSchema.validate({ userId: 'not-a-uuid', role: 'Owner' });
      expect(error).toBeDefined();
    });
  });

  describe('verifyBusinessSchema', () => {
    it('should pass for VERIFIED status', () => {
      const { error } = verifyBusinessSchema.validate({ verificationStatus: 'VERIFIED' });
      expect(error).toBeUndefined();
    });

    it('should fail for unsupported status value', () => {
      const { error } = verifyBusinessSchema.validate({ verificationStatus: 'APPROVED' });
      expect(error).toBeDefined();
    });
  });

  describe('documentSchema', () => {
    it('should pass for valid document metadata', () => {
      const { error } = documentSchema.validate({
        documentType: 'Registration Certificate',
        fileName: 'cert.pdf',
        fileUrl: 'https://cdn.example.com/cert.pdf',
      });
      expect(error).toBeUndefined();
    });

    it('should fail for unknown documentType', () => {
      const { error } = documentSchema.validate({
        documentType: 'Invoice',
        fileName: 'inv.pdf',
        fileUrl: 'https://cdn.example.com/inv.pdf',
      });
      expect(error).toBeDefined();
    });
  });
});
