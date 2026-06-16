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
  },
  product: {
    findUnique: jest.fn(),
  },
  supplyChainEvent: {
    findMany: jest.fn(),
  },
  productIdentity: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  qRCodeAsset: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  verificationEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
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

describe('QR Code & Verification API Endpoints', () => {
  let entrepreneurToken;
  const testBusinessId = 'e2098b6b-8d42-4521-888b-4456b3302343';
  const testProductId = 'd3098b6b-8d42-4521-888b-4456b3302344';
  const testIdentityId = 'f4098b6b-8d42-4521-888b-4456b3302345';
  const testToken = 'abc-token-123';

  beforeAll(() => {
    entrepreneurToken = signAccessToken({
      id: 'usr-entrepreneur-123',
      email: 'ent@test.com',
      role: 'Entrepreneur',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock user profile resolver response
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'usr-entrepreneur-123',
      status: 'ACTIVE',
      role: {
        name: 'Entrepreneur',
        permissions: [
          { permission: { name: 'product-identity:create' } },
          { permission: { name: 'product-identity:view' } },
          { permission: { name: 'product-identity:update' } },
          { permission: { name: 'qr:generate' } },
          { permission: { name: 'qr:download' } },
          { permission: { name: 'verification:view' } },
          { permission: { name: 'verification:statistics' } },
        ],
      },
    });

    // Default mock business and product profiles
    prismaMock.product.findUnique.mockResolvedValue({
      id: testProductId,
      productName: 'Fine Arabica Coffee',
      status: 'ACTIVE',
      countryOfOrigin: 'Rwanda',
      category: { categoryName: 'Coffee' },
      business: {
        id: testBusinessId,
        ownerId: 'usr-entrepreneur-123',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        members: [],
      },
    });
  });

  describe('POST /api/v1/products/:id/identity', () => {
    it('should generate product identity successfully', async () => {
      // Mock versions count
      prismaMock.productIdentity.aggregate.mockResolvedValue({ _max: { qrVersion: 1 } });
      // Setup transaction mock
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      const mockIdentity = {
        id: testIdentityId,
        productId: testProductId,
        verificationToken: testToken,
        qrVersion: 2,
        qrStatus: 'GENERATED',
      };
      prismaMock.productIdentity.create.mockResolvedValue(mockIdentity);

      const res = await request(app)
        .post(`/api/v1/products/${testProductId}/identity`)
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send();

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.identity.verificationToken).toBeDefined();
    });

    it('should prevent identity creation for inactive products', async () => {
      prismaMock.product.findUnique.mockResolvedValue({
        id: testProductId,
        status: 'DRAFT', // INACTIVE state
        business: {
          id: testBusinessId,
          ownerId: 'usr-entrepreneur-123',
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          members: [],
        },
      });

      const res = await request(app)
        .post(`/api/v1/products/${testProductId}/identity`)
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send();

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('active products');
    });
  });

  describe('GET /verify/:verificationToken', () => {
    it('should resolve public verification details for active QR', async () => {
      prismaMock.productIdentity.findUnique.mockResolvedValue({
        id: testIdentityId,
        productId: testProductId,
        verificationToken: testToken,
        qrStatus: 'ACTIVE',
        product: {
          productName: 'Fine Arabica Coffee',
          countryOfOrigin: 'Rwanda',
          category: { categoryName: 'Coffee' },
          business: { businessName: 'Rwandan Women Coffee Coop' },
        },
      });

      prismaMock.verificationEvent.create.mockResolvedValue({ id: 'evt-1' });

      // Mock timeline service query call
      prismaMock.supplyChainEvent.findMany.mockResolvedValue([]);

      const res = await request(app).get(`/verify/${testToken}`).send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('SUCCESS');
      expect(res.body.data.authenticity).toBe('VERIFIED');
    });

    it('should return failed details for revoked QR', async () => {
      prismaMock.productIdentity.findUnique.mockResolvedValue({
        id: testIdentityId,
        productId: testProductId,
        verificationToken: testToken,
        qrStatus: 'REVOKED',
        product: {
          productName: 'Fine Arabica Coffee',
          countryOfOrigin: 'Rwanda',
          category: { categoryName: 'Coffee' },
          business: { businessName: 'Rwandan Women Coffee Coop' },
        },
      });

      prismaMock.verificationEvent.create.mockResolvedValue({ id: 'evt-1' });
      prismaMock.supplyChainEvent.findMany.mockResolvedValue([]);

      const res = await request(app).get(`/verify/${testToken}`).send();

      expect(res.statusCode).toBe(200); // 200 resolved status outcomes
      expect(res.body.data.verificationStatus).toBe('FAILED');
      expect(res.body.data.authenticity).toBe('UNVERIFIED');
      expect(res.body.data.verificationMessage).toContain('revoked');
    });
  });
});
