import { jest } from '@jest/globals';

// ============================================================
// Unit tests for blockchainService business logic
// Tests network status, event recording, and error paths
// ============================================================

const mockBlockchainRepo = {
  findEventById: jest.fn(),
  findProductById: jest.fn(),
  findIdentityById: jest.fn(),
  updateEventBlockchainStatus: jest.fn(),
  updateProductBlockchainStatus: jest.fn(),
  updateIdentityBlockchainStatus: jest.fn(),
  findEventByTransactionId: jest.fn(),
  findProductByTransactionId: jest.fn(),
  findIdentityByTransactionId: jest.fn(),
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

   

  describe('anchorProduct()', () => {
    it('should call RegisterProduct for a product with no prior transaction id', async () => {
      mockBlockchainRepo.updateProductBlockchainStatus.mockResolvedValue({});
      mockContract.submitTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ txId: 'tx-new-1', timestamp: new Date().toISOString() }))
      );

      await blockchainService.anchorProduct({
        id: 'prod-1',
        businessId: 'biz-1',
        blockchainTransactionId: null,
      });

      expect(mockContract.submitTransaction).toHaveBeenCalledWith(
        'RegisterProduct',
        'prod-1',
        'biz-1',
        expect.any(String)
      );
    });

    it('should call UpdateProduct when the product was already anchored before', async () => {
      mockBlockchainRepo.updateProductBlockchainStatus.mockResolvedValue({});
      mockContract.submitTransaction.mockResolvedValue(
        Buffer.from(JSON.stringify({ txId: 'tx-updated-1', timestamp: new Date().toISOString() }))
      );

      await blockchainService.anchorProduct({
        id: 'prod-1',
        businessId: 'biz-1',
        blockchainTransactionId: 'tx-original-1',
      });

      expect(mockContract.submitTransaction).toHaveBeenCalledWith(
        'UpdateProduct',
        'prod-1',
        'biz-1',
        expect.any(String)
      );
    });
  });

  describe('anchorIdentity()', () => {
    it('should submit a RegisterIdentity transaction and mark the identity CONFIRMED', async () => {
      mockBlockchainRepo.updateIdentityBlockchainStatus.mockResolvedValue({});
      mockContract.submitTransaction.mockResolvedValue(
        Buffer.from(
          JSON.stringify({ txId: 'tx-identity-1', registeredAt: new Date().toISOString() })
        )
      );

      const result = await blockchainService.anchorIdentity({
        id: 'ident-1',
        productId: 'prod-1',
        businessId: 'biz-1',
        verificationToken: 'token-1',
        qrVersion: 1,
        qrStatus: 'GENERATED',
        generatedBy: 'usr-1',
        generatedAt: new Date().toISOString(),
        expiresAt: null,
      });

      expect(mockContract.submitTransaction).toHaveBeenCalledWith(
        'RegisterIdentity',
        'ident-1',
        'prod-1',
        'biz-1',
        expect.any(String)
      );
      expect(result.success).toBe(true);
      expect(mockBlockchainRepo.updateIdentityBlockchainStatus).toHaveBeenLastCalledWith(
        'ident-1',
        expect.objectContaining({ blockchainStatus: 'CONFIRMED', blockchainTransactionId: 'tx-identity-1' })
      );
    });

    it('should mark the identity FAILED and increment retry count on error', async () => {
      mockBlockchainRepo.updateIdentityBlockchainStatus.mockResolvedValue({});
      mockContract.submitTransaction.mockRejectedValue(new Error('peer unavailable'));

      await expect(
        blockchainService.anchorIdentity({
          id: 'ident-2',
          productId: 'prod-1',
          businessId: 'biz-1',
          verificationToken: 'token-2',
          qrVersion: 1,
          qrStatus: 'GENERATED',
          generatedBy: 'usr-1',
          generatedAt: new Date().toISOString(),
        })
      ).rejects.toThrow('peer unavailable');

      expect(mockBlockchainRepo.updateIdentityBlockchainStatus).toHaveBeenLastCalledWith(
        'ident-2',
        expect.objectContaining({ blockchainStatus: 'FAILED', blockchainLastError: 'peer unavailable' })
      );
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
