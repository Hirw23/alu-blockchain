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
