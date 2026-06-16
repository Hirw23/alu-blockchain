import { Router } from 'express';
import qrController from '../controllers/qr.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import {
  validateCreateIdentity,
  validateUpdateIdentityStatus,
  validateGenerateQr,
  validateBulkGenerateQr,
} from '../validators/qr.validator.js';

const router = Router();

// =========================================================================
// PUBLIC ENDPOINTS (NO AUTHENTICATION REQUIRED)
// =========================================================================
router.get('/verify/:verificationToken', qrController.verifyToken);
router.get('/api/public/verify/:verificationToken', qrController.verifyToken);

// =========================================================================
// SECURED ENDPOINTS (AUTHENTICATION REQUIRED)
// =========================================================================
const apiPrefix = '/api/v1/products';

// Product Identities
router.post(
  `${apiPrefix}/:id/identity`,
  authenticate,
  checkPermission('product-identity:create'),
  validateCreateIdentity,
  qrController.createIdentity
);

router.get(
  `${apiPrefix}/:id/identity`,
  authenticate,
  checkPermission('product-identity:view'),
  qrController.getIdentity
);

router.patch(
  `${apiPrefix}/:id/identity`,
  authenticate,
  checkPermission('product-identity:update'),
  validateCreateIdentity,
  qrController.updateStatus
);

router.delete(
  `${apiPrefix}/:id/identity`,
  authenticate,
  checkPermission('product-identity:delete'),
  qrController.deleteIdentity
);

router.patch(
  `${apiPrefix}/:id/identity/status`,
  authenticate,
  checkPermission('product-identity:update'),
  validateUpdateIdentityStatus,
  qrController.updateStatus
);

// QR Generation
router.post(
  `${apiPrefix}/:id/qr`,
  authenticate,
  checkPermission('qr:generate'),
  validateGenerateQr,
  qrController.generateQr
);

router.post(
  `${apiPrefix}/:id/qr/regenerate`,
  authenticate,
  checkPermission('qr:regenerate'),
  validateGenerateQr,
  qrController.generateQr
);

router.post(
  `${apiPrefix}/bulk-qr`,
  authenticate,
  checkPermission('qr:generate'),
  validateBulkGenerateQr,
  qrController.bulkGenerate
);

router.get(
  `${apiPrefix}/:id/qr/download`,
  authenticate,
  checkPermission('qr:download'),
  qrController.previewQr
);

router.get(
  `${apiPrefix}/:id/qr/preview`,
  authenticate,
  checkPermission('qr:download'),
  qrController.previewQr
);

// QR Assets
router.get(
  `${apiPrefix}/:id/qr/assets`,
  authenticate,
  checkPermission('qr:download'),
  qrController.getAssets
);

router.delete(
  `${apiPrefix}/:id/qr/assets/:assetId`,
  authenticate,
  checkPermission('qr:generate'),
  qrController.deleteAsset
);

// Verification History & Statistics
router.get(
  `${apiPrefix}/:id/verifications`,
  authenticate,
  checkPermission('verification:view'),
  qrController.getVerifications
);

router.get(
  `${apiPrefix}/:id/verifications/statistics`,
  authenticate,
  checkPermission('verification:statistics'),
  qrController.getStatistics
);

router.get(
  `${apiPrefix}/:id/verifications/latest`,
  authenticate,
  checkPermission('verification:view'),
  qrController.getLatestScan
);

export default router;
