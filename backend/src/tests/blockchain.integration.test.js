import request from 'supertest';
import { jest } from '@jest/globals';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
  },
  supplyChainEvent: {
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
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

describe('Blockchain Integration API Endpoints', () => {
  let adminToken;
  let entrepreneurToken;
  const testEventId = 'e3098b6b-8d42-4521-888b-4456b3302344';

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
      id: 'usr-admin-123',
      status: 'ACTIVE',
      role: {
        name: 'PlatformAdmin',
        permissions: [
          { permission: { name: 'blockchain:record' } },
          { permission: { name: 'blockchain:view' } },
          { permission: { name: 'blockchain:status' } },
        ],
      },
    });

    prismaMock.supplyChainEvent.findUnique.mockResolvedValue({
      id: testEventId,
      productId: 'prod-honey-123',
      businessId: 'biz-123',
      sequenceNumber: 1,
      title: 'Harvested Honey Logs',
      eventStatus: 'LOCKED',
      blockchainStatus: 'PENDING',
    });
  });

  describe('GET /api/v1/blockchain/status', () => {
    it('should query peer network connection health status details', async () => {
      const res = await request(app)
        .get('/api/v1/blockchain/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.networkStatus).toBe('UP');
    });
  });

  describe('POST /api/v1/blockchain/events/:eventId', () => {
    it('should anchor event details to blockchain ledger gateways', async () => {
      prismaMock.supplyChainEvent.update.mockResolvedValue({
        id: testEventId,
        blockchainStatus: 'RECORDED',
        blockchainTransactionId: 'tx-mock-code-123',
      });

      const res = await request(app)
        .post(`/api/v1/blockchain/events/${testEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.blockchainStatus).toBe('RECORDED');
    });

    it('should restrict manual ledger recording to authorized users only', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'usr-ent-123',
        status: 'ACTIVE',
        role: {
          name: 'Entrepreneur',
          permissions: [], // empty permissions block
        },
      });

      const res = await request(app)
        .post(`/api/v1/blockchain/events/${testEventId}`)
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send();

      expect(res.statusCode).toBe(403);
    });
  });
});
