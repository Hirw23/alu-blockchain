import {
  dashboardQuerySchema,
  reportCreateSchema,
  exportRequestSchema,
  reportScheduleSchema,
  trendQuerySchema,
  comparisonQuerySchema,
} from '../schemas/analytics.schema.js';

// ============================================================
// Validation tests for analytics Joi schemas
// ============================================================

const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Analytics Schemas — Validation Tests', () => {
  describe('dashboardQuerySchema', () => {
    it('should pass with no fields (all optional)', () => {
      const { error } = dashboardQuerySchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should pass for each valid dashboard type', () => {
      for (const type of ['ENTREPRENEUR', 'COOPERATIVE', 'ADMIN']) {
        const { error } = dashboardQuerySchema.validate({ dashboardType: type });
        expect(error).toBeUndefined();
      }
    });

    it('should fail for unknown dashboard type', () => {
      const { error } = dashboardQuerySchema.validate({ dashboardType: 'MANAGER' });
      expect(error).toBeDefined();
    });
  });

  describe('reportCreateSchema', () => {
    it('should pass for a valid report definition', () => {
      const { error } = reportCreateSchema.validate({
        name: 'Annual Honey Export',
        reportType: 'PRODUCT',
      });
      expect(error).toBeUndefined();
    });

    it('should fail when name is too short (< 3 chars)', () => {
      const { error } = reportCreateSchema.validate({ name: 'AB', reportType: 'PRODUCT' });
      expect(error).toBeDefined();
    });

    it('should fail when name is too long (> 100 chars)', () => {
      const { error } = reportCreateSchema.validate({ name: 'A'.repeat(101), reportType: 'PRODUCT' });
      expect(error).toBeDefined();
    });

    it('should fail for unsupported reportType', () => {
      const { error } = reportCreateSchema.validate({ name: 'My Report', reportType: 'UNKNOWN' });
      expect(error).toBeDefined();
    });

    it('should accept all valid report types', () => {
      const validTypes = ['BUSINESS', 'PRODUCT', 'SUPPLY_CHAIN', 'VERIFICATION', 'COOPERATIVE', 'PLATFORM', 'SYSTEM_ACTIVITY'];
      for (const reportType of validTypes) {
        const { error } = reportCreateSchema.validate({ name: 'Report Name', reportType });
        expect(error).toBeUndefined();
      }
    });

    it('should default filters to empty object when omitted', () => {
      const { value } = reportCreateSchema.validate({ name: 'My Report', reportType: 'PRODUCT' });
      expect(value.filters).toEqual({});
    });
  });

  describe('exportRequestSchema', () => {
    it('should pass for all supported export formats', () => {
      for (const format of ['PDF', 'EXCEL', 'CSV', 'JSON']) {
        const { error } = exportRequestSchema.validate({ format });
        expect(error).toBeUndefined();
      }
    });

    it('should fail for unsupported format', () => {
      const { error } = exportRequestSchema.validate({ format: 'XML' });
      expect(error).toBeDefined();
    });

    it('should fail when format is missing', () => {
      const { error } = exportRequestSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('reportScheduleSchema', () => {
    const valid = {
      reportDefinitionId: validUUID,
      frequency: 'WEEKLY',
      recipient: 'manager@example.com',
      format: 'PDF',
    };

    it('should pass for valid schedule definition', () => {
      const { error } = reportScheduleSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when reportDefinitionId is not a UUID', () => {
      const { error } = reportScheduleSchema.validate({ ...valid, reportDefinitionId: 'not-uuid' });
      expect(error).toBeDefined();
    });

    it('should fail for unsupported frequency', () => {
      const { error } = reportScheduleSchema.validate({ ...valid, frequency: 'YEARLY' });
      expect(error).toBeDefined();
    });

    it('should fail when recipient email is malformed', () => {
      const { error } = reportScheduleSchema.validate({ ...valid, recipient: 'not-an-email' });
      expect(error).toBeDefined();
    });
  });

  describe('trendQuerySchema', () => {
    it('should default interval to DAILY when omitted', () => {
      const { value } = trendQuerySchema.validate({});
      expect(value.interval).toBe('DAILY');
    });

    it('should pass for all valid intervals', () => {
      for (const interval of ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']) {
        const { error } = trendQuerySchema.validate({ interval });
        expect(error).toBeUndefined();
      }
    });

    it('should fail for unsupported interval', () => {
      const { error } = trendQuerySchema.validate({ interval: 'HOURLY' });
      expect(error).toBeDefined();
    });
  });

  describe('comparisonQuerySchema', () => {
    it('should pass with at least one valid UUID', () => {
      const { error } = comparisonQuerySchema.validate({ targetIds: [validUUID] });
      expect(error).toBeUndefined();
    });

    it('should fail when targetIds is empty', () => {
      const { error } = comparisonQuerySchema.validate({ targetIds: [] });
      expect(error).toBeDefined();
    });

    it('should fail when targetIds contains a non-UUID', () => {
      const { error } = comparisonQuerySchema.validate({ targetIds: ['not-uuid'] });
      expect(error).toBeDefined();
    });
  });
});
