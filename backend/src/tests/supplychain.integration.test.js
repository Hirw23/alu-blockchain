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
  supplyChainEventType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  supplyChainEvent: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  supplyChainLocation: {
    upsert: jest.fn(),
  },
  supplyChainAttachment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  supplyChainComment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
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

describe('Supply Chain Event & Traceability API Endpoints', () => {
  let entrepreneurToken;
  const testBusinessId = 'e2098b6b-8d42-4521-888b-4456b3302343';
  const testProductId = 'd3098b6b-8d42-4521-888b-4456b3302344';
  const testEventTypeId = 'f4098b6b-8d42-4521-888b-4456b3302345';

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
          { permission: { name: 'supply-chain:create' } },
          { permission: { name: 'supply-chain:update' } },
          { permission: { name: 'supply-chain:view' } },
          { permission: { name: 'supply-chain:lock' } },
          { permission: { name: 'supply-chain:comment' } },
          { permission: { name: 'supply-chain:attachments' } },
          { permission: { name: 'product:view' } },
        ],
      },
    });

    // Default mock business and product profiles
    prismaMock.product.findUnique.mockResolvedValue({
      id: testProductId,
      productName: 'Fine Arabica Coffee',
      status: 'ACTIVE',
      business: {
        id: testBusinessId,
        ownerId: 'usr-entrepreneur-123',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        members: [],
      },
    });
  });

  describe('POST /api/v1/supply-chain/events', () => {
    it('should block recording events for inactive products', async () => {
      prismaMock.product.findUnique.mockResolvedValue({
        id: testProductId,
        status: 'DRAFT', // INACTIVE product state
        business: {
          id: testBusinessId,
          ownerId: 'usr-entrepreneur-123',
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          members: [],
        },
      });

      const res = await request(app)
        .post('/api/v1/supply-chain/events')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({
          productId: testProductId,
          eventTypeId: testEventTypeId,
          title: 'Morning Harvesting Log',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('active products');
    });

    it('should block invalid workflow transitions', async () => {
      prismaMock.supplyChainEventType.findUnique.mockResolvedValue({
        id: testEventTypeId,
        name: 'Harvested',
        category: 'Production',
      });

      // Mock previous event to be 'Delivered' (higher weight than 'Harvested')
      prismaMock.supplyChainEvent.findMany.mockResolvedValue([
        {
          id: 'evt-delivered',
          eventStatus: 'CONFIRMED',
          eventType: { name: 'Delivered', category: 'Transportation' },
        },
      ]);

      // Mock aggregate sequence call
      prismaMock.supplyChainEvent.aggregate.mockResolvedValue({ _max: { sequenceNumber: 1 } });
      // Setup transaction mock resolving the transaction callback
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      const res = await request(app)
        .post('/api/v1/supply-chain/events')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({
          productId: testProductId,
          eventTypeId: testEventTypeId,
          title: 'Invalid Harvesting Log',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid workflow transition');
    });
  });

  describe('PATCH /api/v1/supply-chain/events/:id', () => {
    it('should block modification of locked events', async () => {
      prismaMock.supplyChainEvent.findUnique.mockResolvedValue({
        id: 'evt-locked-123',
        productId: testProductId,
        eventStatus: 'LOCKED',
      });

      const res = await request(app)
        .patch('/api/v1/supply-chain/events/evt-locked-123')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({ title: 'New title update attempt' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Locked events are immutable');
    });
  });

  describe('GET /api/v1/products/:id/current-stage', () => {
    it('should resolve the product stage based on latest timeline logs', async () => {
      prismaMock.supplyChainEvent.findMany.mockResolvedValue([
        {
          id: 'evt-1',
          eventStatus: 'CONFIRMED',
          occurredAt: new Date().toISOString(),
          eventType: { name: 'Processed', category: 'Production' },
        },
      ]);

      const res = await request(app)
        .get(`/api/v1/products/${testProductId}/current-stage`)
        .set('Authorization', `Bearer ${entrepreneurToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toBe('Processed');
    });
  });
});
