import blockchainRepository from '../repositories/blockchain.repository.js';
import { blockchainConfig } from '../config/blockchain.js';
import { connectFabric, disconnectFabric, getFabricContract } from '../blockchain/fabricConnection.js';
import { createCanonicalHash } from '../utils/blockchainHash.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

const decodeJson = (payload) => {
  if (!payload) return null;
  return JSON.parse(Buffer.from(payload).toString('utf8'));
};

const parseBlockNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toEventTypeCode = (value) => String(value || 'UNKNOWN').trim().toUpperCase().replace(/\s+/g, '_');

const buildProductAnchorPayload = (product) => ({
  productId: product.id,
  businessId: product.businessId,
  productCode: product.productCode,
  sku: product.sku,
  barcode: product.barcode,
  productName: product.productName,
  productType: product.productType,
  batchNumber: product.batchNumber,
  countryOfOrigin: product.countryOfOrigin,
  productionFacility: product.productionFacility,
  manufacturingDate: product.manufacturingDate,
  expiryDate: product.expiryDate,
  quantity: product.quantity,
  unitOfMeasure: product.unitOfMeasure,
  status: product.status,
  verificationStatus: product.verificationStatus,
  categoryId: product.categoryId,
  createdBy: product.createdBy,
  createdAt: product.createdAt,
});

const buildIdentityAnchorPayload = (identity) => ({
  identityId: identity.id,
  productId: identity.productId,
  businessId: identity.businessId,
  verificationToken: identity.verificationToken,
  qrVersion: identity.qrVersion,
  qrStatus: identity.qrStatus,
  generatedBy: identity.generatedBy,
  generatedAt: identity.generatedAt,
  expiresAt: identity.expiresAt,
});

const buildEventAnchorPayload = (event) => ({
  eventId: event.id,
  productId: event.productId,
  businessId: event.businessId,
  eventTypeCode: toEventTypeCode(event.eventType?.name || event.eventTypeId),
  eventStatus: event.eventStatus,
  title: event.title,
  description: event.description,
  sequenceNumber: event.sequenceNumber,
  occurredAt: event.occurredAt,
  performedBy: event.performedBy,
  location: event.location,
  attachments: (event.attachments || []).map((attachment) => ({
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    documentType: attachment.documentType,
    uploadedAt: attachment.uploadedAt,
  })),
});

const buildDisabledHealth = (message = 'Fabric integration is disabled') => ({
  networkStatus: 'DOWN',
  peerStatus: 'OFFLINE',
  channel: blockchainConfig.fabric.channelName,
  chaincodeVersion: 'unknown',
  connectionStatus: 'DISABLED',
  chaincodeName: blockchainConfig.fabric.chaincodeName,
  message,
});

// Distinct from buildDisabledHealth: blockchain IS enabled and a connection was
// attempted, it just failed (network, TLS, or chaincode-lifecycle issue). Reporting
// this as DISABLED would be misleading -- it looks identical in the UI to
// BLOCKCHAIN_ENABLED=false even though the integration is actively trying.
const buildErrorHealth = (message) => ({
  networkStatus: 'DOWN',
  peerStatus: 'OFFLINE',
  channel: blockchainConfig.fabric.channelName,
  chaincodeVersion: 'unknown',
  connectionStatus: 'ERROR',
  chaincodeName: blockchainConfig.fabric.chaincodeName,
  message,
});

export const blockchainService = {
  async connect() {
    if (!blockchainConfig.enabled) {
      return { status: 'DISABLED', message: 'Fabric integration is disabled by configuration' };
    }

    await connectFabric();
    return { status: 'CONNECTED', message: 'Hyperledger Fabric Gateway connection active' };
  },

  async disconnect() {
    await disconnectFabric();
  },

  async anchorProduct(productOrId) {
    const product =
      typeof productOrId === 'string'
        ? await blockchainRepository.findProductById(productOrId)
        : productOrId;

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!blockchainConfig.enabled) {
      throw new BadRequestError('Fabric integration is disabled');
    }

    await blockchainRepository.updateProductBlockchainStatus(product.id, {
      blockchainStatus: 'PROCESSING',
      blockchainLastError: null,
    });

    try {
      const contract = await getFabricContract();
      const productDataHash = createCanonicalHash(buildProductAnchorPayload(product));
      // A product already carrying a transaction id has been through RegisterProduct
      // before (e.g. re-anchored after an edit) -- that ledger key already exists, so a
      // second RegisterProduct would be rejected by the chaincode. UpdateProduct reuses
      // the same key, letting Fabric's own key-history capture every revision.
      const chaincodeFn = product.blockchainTransactionId ? 'UpdateProduct' : 'RegisterProduct';
      const payload = await contract.submitTransaction(
        chaincodeFn,
        product.id,
        product.businessId,
        productDataHash
      );
      const result = decodeJson(payload);

      await blockchainRepository.updateProductBlockchainStatus(product.id, {
        blockchainStatus: 'CONFIRMED',
        blockchainTransactionId: result?.txId || null,
        blockchainRecordedAt: result?.timestamp ? new Date(result.timestamp) : new Date(),
        blockchainBlockNumber: parseBlockNumber(result?.blockNumber),
        blockchainRetryCount: 0,
        blockchainLastError: null,
      });

      return {
        success: true,
        transactionId: result?.txId || null,
        blockNumber: parseBlockNumber(result?.blockNumber),
        blockchainStatus: 'CONFIRMED',
        dataHash: productDataHash,
      };
    } catch (error) {
      await blockchainRepository.updateProductBlockchainStatus(product.id, {
        blockchainStatus: 'FAILED',
        blockchainRetryCount: { increment: 1 },
        blockchainLastError: error.message,
      });
      throw error;
    }
  },

  async anchorEvent(eventOrId) {
    const event =
      typeof eventOrId === 'string' ? await blockchainRepository.findEventById(eventOrId) : eventOrId;

    if (!event) {
      throw new NotFoundError('Supply Chain Event not found');
    }

    if (!['CONFIRMED', 'LOCKED'].includes(event.eventStatus)) {
      throw new BadRequestError('Only confirmed or locked events can be anchored on-chain');
    }

    if (!blockchainConfig.enabled) {
      throw new BadRequestError('Fabric integration is disabled');
    }

    await blockchainRepository.updateEventBlockchainStatus(event.id, {
      blockchainStatus: 'PROCESSING',
      blockchainLastError: null,
    });

    try {
      const contract = await getFabricContract();
      const dataHash = createCanonicalHash(buildEventAnchorPayload(event));
      const payload = await contract.submitTransaction(
        'RecordEvent',
        event.id,
        event.productId,
        event.businessId,
        toEventTypeCode(event.eventType?.name || event.eventTypeId),
        event.eventStatus,
        dataHash,
        event.performedBy,
        new Date(event.occurredAt).toISOString()
      );
      const result = decodeJson(payload);

      await blockchainRepository.updateEventBlockchainStatus(event.id, {
        blockchainStatus: 'CONFIRMED',
        blockchainTransactionId: result?.txId || null,
        blockchainRecordedAt: result?.timestamp ? new Date(result.timestamp) : new Date(),
        blockchainBlockNumber: parseBlockNumber(result?.blockNumber),
        blockchainRetryCount: 0,
        blockchainLastError: null,
      });

      return {
        success: true,
        transactionId: result?.txId || null,
        blockNumber: parseBlockNumber(result?.blockNumber),
        blockchainStatus: 'CONFIRMED',
        dataHash,
      };
    } catch (error) {
      await blockchainRepository.updateEventBlockchainStatus(event.id, {
        blockchainStatus: 'FAILED',
        blockchainRetryCount: { increment: 1 },
        blockchainLastError: error.message,
      });
      throw error;
    }
  },

  async anchorIdentity(identityOrId) {
    const identity =
      typeof identityOrId === 'string'
        ? await blockchainRepository.findIdentityById(identityOrId)
        : identityOrId;

    if (!identity) {
      throw new NotFoundError('Digital identity not found');
    }

    if (!blockchainConfig.enabled) {
      throw new BadRequestError('Fabric integration is disabled');
    }

    await blockchainRepository.updateIdentityBlockchainStatus(identity.id, {
      blockchainStatus: 'PROCESSING',
      blockchainLastError: null,
    });

    try {
      const contract = await getFabricContract();
      const identityDataHash = createCanonicalHash(buildIdentityAnchorPayload(identity));
      const payload = await contract.submitTransaction(
        'RegisterIdentity',
        identity.id,
        identity.productId,
        identity.businessId,
        identityDataHash
      );
      const result = decodeJson(payload);

      await blockchainRepository.updateIdentityBlockchainStatus(identity.id, {
        blockchainStatus: 'CONFIRMED',
        blockchainTransactionId: result?.txId || null,
        blockchainRecordedAt: result?.registeredAt ? new Date(result.registeredAt) : new Date(),
        blockchainBlockNumber: parseBlockNumber(result?.blockNumber),
        blockchainRetryCount: 0,
        blockchainLastError: null,
      });

      return {
        success: true,
        transactionId: result?.txId || null,
        blockNumber: parseBlockNumber(result?.blockNumber),
        blockchainStatus: 'CONFIRMED',
        dataHash: identityDataHash,
      };
    } catch (error) {
      await blockchainRepository.updateIdentityBlockchainStatus(identity.id, {
        blockchainStatus: 'FAILED',
        blockchainRetryCount: { increment: 1 },
        blockchainLastError: error.message,
      });
      throw error;
    }
  },

  async getOnChainIdentity(identityId) {
    const contract = await getFabricContract();
    return decodeJson(await contract.evaluateTransaction('GetIdentity', identityId));
  },

  async getTransactionStatus(transactionId) {
    const event = await blockchainRepository.findEventByTransactionId(transactionId);
    if (event) {
      const onChainEvent = await this.getOnChainEvent(event.id);
      return {
        transactionId,
        recordType: 'SUPPLY_CHAIN_EVENT',
        key: event.id,
        status: event.blockchainStatus,
        blockNumber: event.blockchainBlockNumber,
        timestamp: event.blockchainRecordedAt,
        channel: blockchainConfig.fabric.channelName,
        chaincode: blockchainConfig.fabric.chaincodeName,
        payload: onChainEvent,
      };
    }

    const product = await blockchainRepository.findProductByTransactionId(transactionId);
    if (product) {
      const onChainProduct = await this.getOnChainProduct(product.id);
      return {
        transactionId,
        recordType: 'PRODUCT',
        key: product.id,
        status: product.blockchainStatus,
        blockNumber: product.blockchainBlockNumber,
        timestamp: product.blockchainRecordedAt,
        channel: blockchainConfig.fabric.channelName,
        chaincode: blockchainConfig.fabric.chaincodeName,
        payload: onChainProduct,
      };
    }

    const identity = await blockchainRepository.findIdentityByTransactionId(transactionId);
    if (identity) {
      const onChainIdentity = await this.getOnChainIdentity(identity.id);
      return {
        transactionId,
        recordType: 'PRODUCT_IDENTITY',
        key: identity.id,
        status: identity.blockchainStatus,
        blockNumber: identity.blockchainBlockNumber,
        timestamp: identity.blockchainRecordedAt,
        channel: blockchainConfig.fabric.channelName,
        chaincode: blockchainConfig.fabric.chaincodeName,
        payload: onChainIdentity,
      };
    }

    throw new NotFoundError('Blockchain transaction not found');
  },

  async getOnChainEvent(eventId) {
    const contract = await getFabricContract();
    return decodeJson(await contract.evaluateTransaction('GetEvent', eventId));
  },

  async getOnChainProduct(productId) {
    const contract = await getFabricContract();
    return decodeJson(await contract.evaluateTransaction('GetProduct', productId));
  },

  async getEventHistory(eventId) {
    const contract = await getFabricContract();
    return decodeJson(await contract.evaluateTransaction('GetEventHistory', eventId)) || [];
  },

  async getProductTimeline(productId) {
    const contract = await getFabricContract();
    return decodeJson(await contract.evaluateTransaction('GetProductTimeline', productId)) || [];
  },

  async healthCheck() {
    if (!blockchainConfig.enabled) {
      return buildDisabledHealth();
    }

    try {
      const contract = await getFabricContract();
      const payload = await contract.evaluateTransaction('Ping');
      const result = decodeJson(payload);

      return {
        networkStatus: 'UP',
        peerStatus: 'ONLINE',
        channel: blockchainConfig.fabric.channelName,
        chaincodeVersion: result?.chaincodeVersion || '1.0.0',
        connectionStatus: 'CONNECTED',
        chaincodeName: blockchainConfig.fabric.chaincodeName,
        peerEndpoint: blockchainConfig.fabric.peerEndpoint,
        gateway: result,
      };
    } catch (error) {
      return buildErrorHealth(error.message);
    }
  },

  async recordEvent(eventId) {
    const result = await this.anchorEvent(eventId);
    return {
      success: result.success,
      transactionId: result.transactionId,
      blockNumber: result.blockNumber,
      blockchainStatus: result.blockchainStatus,
    };
  },

  async getTransactionDetails(transactionId) {
    return this.getTransactionStatus(transactionId);
  },

  async getNetworkStatus() {
    return this.healthCheck();
  },
};

export default blockchainService;
