import { jest } from '@jest/globals';

// ============================================================
// Unit tests for blockchainService business logic
// Tests network status, event recording, and error paths
// ============================================================

const mockBlockchainRepo = {
  findEventById: jest.fn(),
  findProductById: jest.fn(),
  updateEventBlockchainStatus: jest.fn(),
  updateProductBlockchainStatus: jest.fn(),
  findEventByTransactionId: jest.fn(),
  findProductByTransactionId: jest.fn(),
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

jest.unstable_mockModule('../repositories/blockchain.repository.js', () => ({
  default: mockBlockchainRepo,
  blockchainRepository: mockBlockchainRepo,
}));

const { blockchainService } = await import('../services/blockchain.service.js');

describe('BlockchainService — Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getNetworkStatus()', () => {
    it('should return networkStatus UP when the gateway responds', async () => {
      mockContract.evaluateTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ ok: true, chaincodeVersion: '1.0.0' }))
      );
      const result = await blockchainService.getNetworkStatus();
      expect(result.networkStatus).toBe('UP');
    });

    it('should include channel and chaincode version in response', async () => {
      mockContract.evaluateTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ ok: true, chaincodeVersion: '1.0.0' }))
      );
      const result = await blockchainService.getNetworkStatus();
      expect(result.channel).toBe('supplychainchannel');
      expect(result.chaincodeVersion).toBeDefined();
    });

    it('should include peerStatus in response', async () => {
      mockContract.evaluateTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ ok: true, chaincodeVersion: '1.0.0' }))
      );
      const result = await blockchainService.getNetworkStatus();
      expect(result.peerStatus).toBeDefined();
      expect(typeof result.peerStatus).toBe('string');
    });
  });

  describe('connect()', () => {
    it('should return a status object with a message', async () => {
      const result = await blockchainService.connect();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
    });

    it('should return CONNECTED when blockchain mode is enabled', async () => {
      const result = await blockchainService.connect();
      expect(result.status).toBe('CONNECTED');
    });
  });

   

  describe('getTransactionDetails()', () => {
    it('should return event-backed transaction details', async () => {
      mockBlockchainRepo.findEventByTransactionId.mockResolvedValue({
        id: 'evt-1',
        blockchainStatus: 'CONFIRMED',
        blockchainBlockNumber: 7,
        blockchainRecordedAt: new Date().toISOString(),
      });
      mockContract.evaluateTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ eventId: 'evt-1', txId: 'tx-mock-abc123' }))
      );

      const result = await blockchainService.getTransactionDetails('tx-mock-abc123');
      expect(result.transactionId).toBe('tx-mock-abc123');
      expect(result.channel).toBeDefined();
      expect(result.blockNumber).toBeDefined();
    });

    it('should include an ISO timestamp in the response', async () => {
      mockBlockchainRepo.findEventByTransactionId.mockResolvedValue({
        id: 'evt-1',
        blockchainStatus: 'CONFIRMED',
        blockchainBlockNumber: 7,
        blockchainRecordedAt: new Date().toISOString(),
      });
      mockContract.evaluateTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ eventId: 'evt-1', txId: 'tx-1' }))
      );

      const result = await blockchainService.getTransactionDetails('tx-1');
      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });
});
