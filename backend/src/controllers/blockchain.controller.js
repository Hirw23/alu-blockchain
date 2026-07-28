import blockchainService from '../services/blockchain.service.js';
import blockchainRepository from '../repositories/blockchain.repository.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const blockchainController = {
  recordEvent: asyncHandler(async (req, res) => {
    const result = await blockchainService.recordEvent(req.params.eventId);
    res.status(201).json(successResponse('Supply Chain Event anchored on ledger', result));
  }),

  anchorProduct: asyncHandler(async (req, res) => {
    const result = await blockchainService.anchorProduct(req.params.productId);
    res.status(201).json(successResponse('Product anchored on ledger', result));
  }),

  getProductBlockchainInfo: asyncHandler(async (req, res) => {
    const product = await blockchainRepository.findProductById(req.params.productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.status(200).json(
      successResponse('Product blockchain mapping details', {
        productId: product.id,
        productName: product.productName,
        blockchainStatus: product.blockchainStatus,
        blockchainTransactionId: product.blockchainTransactionId,
        blockchainRecordedAt: product.blockchainRecordedAt,
        blockchainBlockNumber: product.blockchainBlockNumber,
        blockchainRetryCount: product.blockchainRetryCount,
        blockchainLastError: product.blockchainLastError,
      })
    );
  }),

  listRecentProducts: asyncHandler(async (req, res) => {
    const products = await blockchainRepository.findRecentProducts();
    res.status(200).json(
      successResponse(
        'Recent products with ledger anchor status',
        products.map((product) => ({
          id: product.id,
          productName: product.productName,
          businessName: product.business?.businessName,
          status: product.status,
          blockchainStatus: product.blockchainStatus,
          blockchainTransactionId: product.blockchainTransactionId,
          blockchainRetryCount: product.blockchainRetryCount,
          blockchainLastError: product.blockchainLastError,
          createdAt: product.createdAt,
        }))
      )
    );
  }),

  anchorIdentity: asyncHandler(async (req, res) => {
    const result = await blockchainService.anchorIdentity(req.params.identityId);
    res.status(201).json(successResponse('Digital identity anchored on ledger', result));
  }),

  getIdentityBlockchainInfo: asyncHandler(async (req, res) => {
    const identity = await blockchainRepository.findIdentityById(req.params.identityId);
    if (!identity) {
      throw new NotFoundError('Digital identity not found');
    }
    res.status(200).json(
      successResponse('Digital identity blockchain mapping details', {
        identityId: identity.id,
        productId: identity.productId,
        qrStatus: identity.qrStatus,
        blockchainStatus: identity.blockchainStatus,
        blockchainTransactionId: identity.blockchainTransactionId,
        blockchainRecordedAt: identity.blockchainRecordedAt,
        blockchainBlockNumber: identity.blockchainBlockNumber,
        blockchainRetryCount: identity.blockchainRetryCount,
        blockchainLastError: identity.blockchainLastError,
      })
    );
  }),

  listRecentIdentities: asyncHandler(async (req, res) => {
    const identities = await blockchainRepository.findRecentIdentities();
    res.status(200).json(
      successResponse(
        'Recent digital identities with ledger anchor status',
        identities.map((identity) => ({
          id: identity.id,
          productName: identity.product?.productName,
          qrStatus: identity.qrStatus,
          blockchainStatus: identity.blockchainStatus,
          blockchainTransactionId: identity.blockchainTransactionId,
          blockchainRetryCount: identity.blockchainRetryCount,
          blockchainLastError: identity.blockchainLastError,
          generatedAt: identity.generatedAt,
        }))
      )
    );
  }),

  getEventBlockchainInfo: asyncHandler(async (req, res) => {
    const event = await blockchainRepository.findEventById(req.params.eventId);
    if (!event) {
      throw new NotFoundError('Supply Chain Event not found');
    }
    res.status(200).json(
      successResponse('Supply Chain Event blockchain mapping details', {
        blockchainStatus: event.blockchainStatus,
        blockchainTransactionId: event.blockchainTransactionId,
        blockchainRecordedAt: event.blockchainRecordedAt,
        blockchainBlockNumber: event.blockchainBlockNumber,
        blockchainRetryCount: event.blockchainRetryCount,
        blockchainLastError: event.blockchainLastError,
      })
    );
  }),

  getAnchorStatus: asyncHandler(async (req, res) => {
    const event = await blockchainRepository.findEventById(req.params.eventId);
    if (!event) {
      throw new NotFoundError('Supply Chain Event not found');
    }

    res.status(200).json(
      successResponse('Supply Chain Event anchor status retrieved successfully', {
        eventId: event.id,
        eventStatus: event.eventStatus,
        blockchainStatus: event.blockchainStatus,
        blockchainTransactionId: event.blockchainTransactionId,
        blockchainRecordedAt: event.blockchainRecordedAt,
        blockchainBlockNumber: event.blockchainBlockNumber,
        blockchainRetryCount: event.blockchainRetryCount,
        blockchainLastError: event.blockchainLastError,
      })
    );
  }),

  getTransactionDetails: asyncHandler(async (req, res) => {
    const tx = await blockchainService.getTransactionDetails(req.params.transactionId);
    res.status(200).json(successResponse('Blockchain ledger block payload audited', { tx }));
  }),

  getEventHistory: asyncHandler(async (req, res) => {
    const history = await blockchainService.getEventHistory(req.params.eventId);
    res.status(200).json(successResponse('Blockchain event history retrieved successfully', { history }));
  }),

  getNetworkStatus: asyncHandler(async (req, res) => {
    const status = await blockchainService.getNetworkStatus();
    res.status(200).json(successResponse('Blockchain Peer network health status', status));
  }),
};

export default blockchainController;
