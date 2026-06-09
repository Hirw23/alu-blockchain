import request from 'supertest';
import { jest } from '@jest/globals';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  business: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  businessAddress: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
  businessDocument: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  cooperative: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  businessMember: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
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

describe('Businesses & Cooperatives API Endpoints', () => {
  let entrepreneurToken;
  let adminToken;

  beforeAll(() => {
    // Generate valid test JWTs for authentication
    entrepreneurToken = signAccessToken({
      id: 'usr-entrepreneur-123',
      email: 'ent@test.com',
      role: 'Entrepreneur',
    });
    adminToken = signAccessToken({
      id: 'usr-admin-123',
      email: 'admin@test.com',
      role: 'PlatformAdmin',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock user profile resolver response for all authentication middleware checks
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'usr-entrepreneur-123',
      status: 'ACTIVE',
      role: {
        name: 'Entrepreneur',
        permissions: [
          { permission: { name: 'business:create' } },
          { permission: { name: 'business:update' } },
          { permission: { name: 'business:view' } },
          { permission: { name: 'business:delete' } },
          { permission: { name: 'business:manage-members' } },
        ],
      },
    });
  });

  describe('POST /api/v1/businesses', () => {
    it('should block business creation without authentication', async () => {
      const res = await request(app).post('/api/v1/businesses').send({});
      expect(res.statusCode).toBe(401);
    });

    it('should validate business creation fields and return 422', async () => {
      const res = await request(app)
        .post('/api/v1/businesses')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({ businessName: 'Mamma Honey' });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should successfully register a business and assign Owner member', async () => {
      // Mock duplicate queries (returns null) and then the transaction fetch (returns the business)
      prismaMock.business.findUnique
        .mockResolvedValueOnce(null) // Registration number check
        .mockResolvedValueOnce(null) // Tax identification number check
        .mockResolvedValueOnce({
          id: 'bus-123',
          ownerId: 'usr-entrepreneur-123',
          businessName: 'Mamma Honey Ltd',
          tradingName: 'Mamma Honey',
          businessType: 'Retail',
          industry: 'Agriculture',
          registrationNumber: 'RC123456',
          taxIdentificationNumber: 'TIN987654',
          email: 'info@mammahoney.com',
          phoneNumber: '+250788123456',
        }); // Final return

      prismaMock.role.findUnique.mockResolvedValue({
        id: 'role-entrepreneur-id',
        name: 'Entrepreneur',
      });

      // Mock prisma transaction execution
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      const mockBusiness = {
        id: 'bus-123',
        ownerId: 'usr-entrepreneur-123',
        businessName: 'Mamma Honey Ltd',
        tradingName: 'Mamma Honey',
        businessType: 'Retail',
        industry: 'Agriculture',
        registrationNumber: 'RC123456',
        taxIdentificationNumber: 'TIN987654',
        email: 'info@mammahoney.com',
        phoneNumber: '+250788123456',
      };

      prismaMock.business.create.mockResolvedValue(mockBusiness);

      const res = await request(app)
        .post('/api/v1/businesses')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({
          businessName: 'Mamma Honey Ltd',
          tradingName: 'Mamma Honey',
          businessType: 'Retail',
          industry: 'Agriculture',
          registrationNumber: 'RC123456',
          taxIdentificationNumber: 'TIN987654',
          email: 'info@mammahoney.com',
          phoneNumber: '+250788123456',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.businessName).toBe('Mamma Honey Ltd');
    });
  });

  describe('PATCH /api/v1/businesses/:id/verify', () => {
    it('should block business verification for non-PlatformAdmin users', async () => {
      const res = await request(app)
        .patch('/api/v1/businesses/bus-123/verify')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({ verificationStatus: 'VERIFIED' });

      expect(res.statusCode).toBe(403);
    });

    it('should allow PlatformAdmin to verify a business', async () => {
      // Mock auth user query for Admin
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'usr-admin-123',
        status: 'ACTIVE',
        role: {
          name: 'PlatformAdmin',
          permissions: [], // PlatformAdmin bypasses permission checks
        },
      });

      prismaMock.business.findUnique.mockResolvedValue({
        id: 'bus-123',
        ownerId: 'usr-entrepreneur-123',
        businessName: 'Mamma Honey Ltd',
        tradingName: 'Mamma Honey',
        verificationStatus: 'PENDING',
        status: 'SUBMITTED',
        members: [],
      });

      prismaMock.business.update.mockResolvedValue({
        id: 'bus-123',
        verificationStatus: 'VERIFIED',
        status: 'ACTIVE',
      });

      const res = await request(app)
        .patch('/api/v1/businesses/bus-123/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verificationStatus: 'VERIFIED' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.verificationStatus).toBe('VERIFIED');
    });
  });
});
