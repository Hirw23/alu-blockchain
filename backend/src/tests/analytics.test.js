import request from 'supertest';
import { jest } from '@jest/globals';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  business: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  supplyChainEvent: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  productIdentity: {
    count: jest.fn(),
  },
  verificationEvent: {
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  reportDefinition: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  generatedReport: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  reportSchedule: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  cooperative: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock database client module
jest.unstable_mockModule('../database/client.js', () => {
  return {
    prisma: prismaMock,
    default: prismaMock,
  };
});

// Import app after mock registration
const { default: app } = await import('../app.js');
const { signAccessToken } = await import('../utils/jwt.utils.js');

describe('Analytics & Reporting API Endpoints', () => {
  let adminToken;
  let entrepreneurToken;
  const testBusinessId = 'e2098b6b-8d42-4521-888b-4456b3302343';
  const testReportDefinitionId = 'r4098b6b-8d42-4521-888b-4456b3302345';

  beforeAll(() => {
    adminToken = signAccessToken({
      id: 'usr-admin-123',
      email: 'admin@test.com',
      role: 'PlatformAdmin',
    });
    entrepreneurToken = signAccessToken({
      id: 'usr-ent-123',
      email: 'ent@test.com',
      role: 'Entrepreneur',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock user profile resolver response
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'usr-ent-123',
      status: 'ACTIVE',
      role: {
        name: 'Entrepreneur',
        permissions: [
          { permission: { name: 'analytics:dashboard' } },
          { permission: { name: 'analytics:kpis' } },
          { permission: { name: 'analytics:reports' } },
          { permission: { name: 'analytics:exports' } },
          { permission: { name: 'reports:create' } },
          { permission: { name: 'reports:download' } },
          { permission: { name: 'reports:manage' } },
        ],
      },
    });

    prismaMock.business.findUnique.mockResolvedValue({
      id: testBusinessId,
      ownerId: 'usr-ent-123',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      members: [],
    });
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return entrepreneur dashboard metrics', async () => {
      prismaMock.business.findMany.mockResolvedValue([{ id: testBusinessId }]);
      prismaMock.product.count.mockResolvedValue(5);
      prismaMock.productIdentity.count.mockResolvedValue(2);
      prismaMock.verificationEvent.count.mockResolvedValue(10);
      prismaMock.supplyChainEvent.count.mockResolvedValue(12);

      const res = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProducts).toBe(5);
    });

    it('should restrict admin dashboard to admins only', async () => {
      const res1 = await request(app)
        .get('/api/v1/analytics/dashboard?dashboardType=ADMIN')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send();

      expect(res1.statusCode).toBe(403);

      // Verify PlatformAdmin permissions successfully load dashboard metrics
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'usr-admin-123',
        status: 'ACTIVE',
        role: {
          name: 'PlatformAdmin',
          permissions: [{ permission: { name: 'analytics:dashboard' } }],
        },
      });

      const res2 = await request(app)
        .get('/api/v1/analytics/dashboard?dashboardType=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res2.statusCode).toBe(200);
    });
  });

  describe('POST /api/v1/reports', () => {
    it('should register a new report definition', async () => {
      const mockDef = {
        id: testReportDefinitionId,
        name: 'Annual Product Export Report',
        reportType: 'PRODUCT',
        createdBy: 'usr-ent-123',
        filters: '{}',
      };
      prismaMock.reportDefinition.create.mockResolvedValue(mockDef);

      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({
          name: 'Annual Product Export Report',
          reportType: 'PRODUCT',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.definition.name).toBe('Annual Product Export Report');
    });
  });

  describe('POST /api/v1/reports/:id/export', () => {
    it('should generate report file exports successfully', async () => {
      prismaMock.reportDefinition.findUnique.mockResolvedValue({
        id: testReportDefinitionId,
        name: 'Annual Product Export Report',
        reportType: 'PRODUCT',
        filters: '{}',
      });

      const mockExport = {
        id: 'exp-123',
        reportDefinitionId: testReportDefinitionId,
        format: 'JSON',
        filePath: 'uploads/mock.json',
      };
      prismaMock.generatedReport.create.mockResolvedValue(mockExport);

      const res = await request(app)
        .post(`/api/v1/reports/${testReportDefinitionId}/export`)
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({ format: 'JSON' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.report.format).toBe('JSON');
    });
  });
});
