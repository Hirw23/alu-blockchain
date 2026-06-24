import { Router } from 'express';
import blockchainController from '../controllers/blockchain.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import {
  validateRecordEventParams,
  validateTransactionLookupParams,
} from '../validators/blockchain.validator.js';

const router = Router();

router.get(
  '/status',
  authenticate,
  checkPermission('blockchain:status'),
  blockchainController.getNetworkStatus
);

router.post(
  '/events/:eventId',
  authenticate,
  checkPermission('blockchain:record'),
  validateRecordEventParams,
  blockchainController.recordEvent
);

router.get(
  '/events/:eventId',
  authenticate,
  checkPermission('blockchain:view'),
  validateRecordEventParams,
  blockchainController.getEventBlockchainInfo
);

router.get(
  '/transactions/:transactionId',
  authenticate,
  checkPermission('blockchain:view'),
  validateTransactionLookupParams,
  blockchainController.getTransactionDetails
);

export default router;
