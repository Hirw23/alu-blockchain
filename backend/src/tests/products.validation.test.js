import {
  createProductSchema,
  updateProductStatusSchema,
  imageMetadataSchema,
  productDocumentSchema,
  createVariantSchema,
} from '../schemas/products.schema.js';

// ============================================================
// Validation tests for products Joi schemas
// ============================================================

describe('Products Schemas — Validation Tests', () => {
  describe('createProductSchema', () => {
    const valid = {
      businessId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      categoryId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      productName: 'Organic Honey',
      productCode: 'PROD-001',
      sku: 'SKU-001',
      barcode: 'BAR-001',
      productType: 'Raw',
      countryOfOrigin: 'Rwanda',
      unitOfMeasure: 'KG',
    };

    it('should pass for a fully valid product payload', () => {
      const { error } = createProductSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when businessId is not a UUID', () => {
      const { error } = createProductSchema.validate({ ...valid, businessId: 'not-uuid' });
      expect(error).toBeDefined();
    });

    it('should fail when productName is missing', () => {
      const { error } = createProductSchema.validate({ ...valid, productName: undefined });
      expect(error).toBeDefined();
    });

    it('should fail when sku is missing', () => {
      const { error } = createProductSchema.validate({ ...valid, sku: undefined });
      expect(error).toBeDefined();
    });

    it('should fail when quantity is negative', () => {
      const { error } = createProductSchema.validate({ ...valid, quantity: -5 });
      expect(error).toBeDefined();
    });

    it('should default quantity to 0 when omitted', () => {
      const { value } = createProductSchema.validate(valid);
      expect(value.quantity).toBe(0);
    });
  });

  describe('updateProductStatusSchema', () => {
    it('should pass for ACTIVE status', () => {
      const { error } = updateProductStatusSchema.validate({ status: 'ACTIVE' });
      expect(error).toBeUndefined();
    });

    it('should fail for unknown status value', () => {
      const { error } = updateProductStatusSchema.validate({ status: 'ENABLED' });
      expect(error).toBeDefined();
    });

    it('should pass for DISCONTINUED status', () => {
      const { error } = updateProductStatusSchema.validate({ status: 'DISCONTINUED' });
      expect(error).toBeUndefined();
    });
  });

  describe('imageMetadataSchema', () => {
    it('should pass for valid image metadata', () => {
      const { error } = imageMetadataSchema.validate({
        fileName: 'honey.jpg',
        fileUrl: 'https://cdn.example.com/honey.jpg',
      });
      expect(error).toBeUndefined();
    });

    it('should fail when fileUrl is not a valid URI', () => {
      const { error } = imageMetadataSchema.validate({
        fileName: 'honey.jpg',
        fileUrl: 'not-a-url',
      });
      expect(error).toBeDefined();
    });
  });

  describe('productDocumentSchema', () => {
    it('should pass for a valid document type', () => {
      const { error } = productDocumentSchema.validate({
        documentType: 'Certificate',
        fileName: 'cert.pdf',
        fileUrl: 'https://cdn.example.com/cert.pdf',
      });
      expect(error).toBeUndefined();
    });

    it('should fail for unsupported document type', () => {
      const { error } = productDocumentSchema.validate({
        documentType: 'Invoice',
        fileName: 'inv.pdf',
        fileUrl: 'https://cdn.example.com/inv.pdf',
      });
      expect(error).toBeDefined();
    });
  });

  describe('createVariantSchema', () => {
    it('should pass for valid variant data', () => {
      const { error } = createVariantSchema.validate({
        variantName: 'Small Jar',
        sku: 'SKU-V-001',
        barcode: 'BAR-V-001',
        unitOfMeasure: 'G',
      });
      expect(error).toBeUndefined();
    });

    it('should fail when variantName is missing', () => {
      const { error } = createVariantSchema.validate({
        sku: 'SKU-V-001',
        barcode: 'BAR-V-001',
        unitOfMeasure: 'G',
      });
      expect(error).toBeDefined();
    });
  });
});
