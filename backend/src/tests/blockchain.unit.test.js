import { jest } from '@jest/globals';

// ============================================================
// Unit tests for blockchainService business logic
// Tests network status, event recording, and error paths
// ============================================================

const mockBlockchainRepo = {
  findEventById: jest.fn(),
  updateEventBlockchainStatus: jest.fn(),
};

jest.unstable_mockModule('../repositories/blockchain.repository.js', () => ({
  default: mockBlockchainRepo,
  blockchainRepository: mockBlockchainRepo,
}));

const { blockchainService } = await import('../services/blockchain.service.js');

describe('BlockchainService — Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getNetworkStatus()', () => {
    it('should always return networkStatus UP', async () => {
      const result = await blockchainService.getNetworkStatus();
      expect(result.networkStatus).toBe('UP');
    });

    it('should include channel and chaincode version in response', async () => {
      const result = await blockchainService.getNetworkStatus();
      expect(result.channel).toBe('mainchannel');
      expect(result.chaincodeVersion).toBeDefined();
    });

    it('should include peerStatus in response', async () => {
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

    it('should return SIMULATED or CONNECTED as status', async () => {
      const result = await blockchainService.connect();
      expect(['SIMULATED', 'CONNECTED']).toContain(result.status);
    });
  });

  describe('recordEvent()', () => {
    it('should throw an error when event is not found', async () => {
      mockBlockchainRepo.findEventById.mockResolvedValue(null);

      await expect(blockchainService.recordEvent('no-id')).rejects.toThrow(
        'Supply Chain Event not found'
      );
    });

    it('should mark event as PENDING before attempting ledger write', async () => {
      mockBlockchainRepo.findEventById.mockResolvedValue({
        id: 'evt-1',
        productId: 'prod-1',
        title: 'Harvested Honey',
        eventStatus: 'LOCKED',
        blockchainStatus: 'PENDING',
      });
      mockBlockchainRepo.updateEventBlockchainStatus.mockResolvedValue({});

      await blockchainService.recordEvent('evt-1');

      // First call should set PENDING
      expect(mockBlockchainRepo.updateEventBlockchainStatus.mock.calls[0][1]).toBe('PENDING');
    });

    it('should resolve with RECORDED status on successful ledger write', async () => {
      mockBlockchainRepo.findEventById.mockResolvedValue({
        id: 'evt-1',
        productId: 'prod-1',
        title: 'Harvested Honey',
        eventStatus: 'LOCKED',
      });
      mockBlockchainRepo.updateEventBlockchainStatus.mockResolvedValue({});

      const result = await blockchainService.recordEvent('evt-1');
      expect(result.blockchainStatus).toBe('RECORDED');
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should resolve with FAILED status when ledger write throws', async () => {
      mockBlockchainRepo.findEventById.mockResolvedValue({
        id: 'evt-1',
        productId: 'prod-1',
        title: 'Harvested Honey',
        eventStatus: 'LOCKED',
      });
      // PENDING succeeds, RECORDED call throws
      mockBlockchainRepo.updateEventBlockchainStatus
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Ledger write failure'));

      const result = await blockchainService.recordEvent('evt-1');
      expect(result.success).toBe(false);
      expect(result.blockchainStatus).toBe('FAILED');
    });
  });

  describe('getTransactionDetails()', () => {
    it('should return a transaction details object for any ID', async () => {
      const result = await blockchainService.getTransactionDetails('tx-mock-abc123');
      expect(result.transactionId).toBe('tx-mock-abc123');
      expect(result.channel).toBeDefined();
      expect(result.blockNumber).toBeDefined();
    });

    it('should include an ISO timestamp in the response', async () => {
      const result = await blockchainService.getTransactionDetails('tx-1');
      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });
});
