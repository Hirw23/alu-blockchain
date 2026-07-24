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

const mockContract = {
  submitTransaction: jest.fn(),
  evaluateTransaction: jest.fn(),
};

jest.unstable_mockModule('../config/blockchain.js', () => ({
  blockchainConfig: {
    enabled: true,
    fabric: {
      channelName: 'supplychainchannel',
      chaincodeName: 'supplychain-cc',
      peerEndpoint: 'localhost:7051',
    },
  },
}));

jest.unstable_mockModule('../blockchain/fabricConnection.js', () => ({
  connectFabric: jest.fn(),
  disconnectFabric: jest.fn(),
  getFabricContract: jest.fn().mockResolvedValue(mockContract),
}));

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
      performedBy: 'usr-admin-123',
      sequenceNumber: 1,
      title: 'Harvested Honey Logs',
      eventStatus: 'LOCKED',
      occurredAt: new Date().toISOString(),
      eventType: { name: 'Harvested' },
      attachments: [],
      blockchainStatus: 'PENDING',
    });
  });

  describe('GET /api/v1/blockchain/status', () => {
    it('should query peer network connection health status details', async () => {
      mockContract.evaluateTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ ok: true, chaincodeVersion: '1.0.0' }))
      );
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
        blockchainStatus: 'CONFIRMED',
        blockchainTransactionId: 'tx-mock-code-123',
      });
      mockContract.submitTransaction.mockResolvedValue(
        Buffer.from(
          JSON.stringify({
            txId: 'tx-mock-code-123',
            blockNumber: 9,
            timestamp: new Date().toISOString(),
          })
        )
      );

      const res = await request(app)
        .post(`/api/v1/blockchain/events/${testEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.blockchainStatus).toBe('CONFIRMED');
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
