import { Router } from 'express';
import blockchainController from '../controllers/blockchain.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import {
  validateRecordEventParams,
  validateProductParams,
  validateIdentityParams,
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
  '/anchor-status/:eventId',
  authenticate,
  checkPermission('blockchain:view'),
  validateRecordEventParams,
  blockchainController.getAnchorStatus
);

router.get(
  '/events/:eventId',
  authenticate,
  checkPermission('blockchain:view'),
  validateRecordEventParams,
  blockchainController.getEventBlockchainInfo
);

router.get(
  '/events/:eventId/history',
  authenticate,
  checkPermission('blockchain:view'),
  validateRecordEventParams,
  blockchainController.getEventHistory
);

router.get(
  '/transactions/:transactionId',
  authenticate,
  checkPermission('blockchain:view'),
  validateTransactionLookupParams,
  blockchainController.getTransactionDetails
);

router.get(
  '/products',
  authenticate,
  checkPermission('blockchain:view'),
  blockchainController.listRecentProducts
);

router.post(
  '/products/:productId',
  authenticate,
  checkPermission('blockchain:record'),
  validateProductParams,
  blockchainController.anchorProduct
);

router.get(
  '/products/:productId',
  authenticate,
  checkPermission('blockchain:view'),
  validateProductParams,
  blockchainController.getProductBlockchainInfo
);

router.get(
  '/identities',
  authenticate,
  checkPermission('blockchain:view'),
  blockchainController.listRecentIdentities
);

router.post(
  '/identities/:identityId',
  authenticate,
  checkPermission('blockchain:record'),
  validateIdentityParams,
  blockchainController.anchorIdentity
);

router.get(
  '/identities/:identityId',
  authenticate,
  checkPermission('blockchain:view'),
  validateIdentityParams,
  blockchainController.getIdentityBlockchainInfo
);

export default router;
