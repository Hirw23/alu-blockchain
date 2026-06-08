import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/auth.js';
import businessesController from '../controllers/businesses.controller.js';
import {
  validateCreateBusiness,
  validateUpdateBusiness,
  validateAddress,
  validateDocument,
  validateVerifyDocument,
  validateMemberAssignment,
  validateUpdateMemberRole,
  validateUpdateStatus,
  validateVerifyBusiness,
  validateSearchBusiness,
} from '../validators/businesses.validator.js';

const router = Router();

// Apply auth globally to all businesses routes
router.use(authenticate);

// Primary Business CRUD & State Endpoints
router.post(
  '/',
  checkPermission('business:create'),
  validateCreateBusiness,
  businessesController.create
);
router.get(
  '/',
  checkPermission('business:view'),
  validateSearchBusiness,
  businessesController.getAll
);
router.get('/me', checkPermission('business:view'), businessesController.getMe);
router.get('/:id', checkPermission('business:view'), businessesController.getById);
router.patch(
  '/:id',
  checkPermission('business:update'),
  validateUpdateBusiness,
  businessesController.update
);
router.delete('/:id', checkPermission('business:delete'), businessesController.delete);

router.patch(
  '/:id/status',
  checkPermission('business:update'),
  validateUpdateStatus,
  businessesController.updateStatus
);
router.patch(
  '/:id/verify',
  checkPermission('business:verify'),
  validateVerifyBusiness,
  businessesController.verify
);
router.get('/:id/statistics', checkPermission('business:view'), businessesController.getStatistics);

// Address Management Sub-routes
router.post(
  '/:id/address',
  checkPermission('business:update'),
  validateAddress,
  businessesController.updateAddress
);
router.get('/:id/address', checkPermission('business:view'), businessesController.getAddress);
router.patch(
  '/:id/address',
  checkPermission('business:update'),
  validateAddress,
  businessesController.updateAddress
);

// Documents Metadata Sub-routes
router.post(
  '/:id/documents',
  checkPermission('business:update'),
  validateDocument,
  businessesController.addDocument
);
router.get('/:id/documents', checkPermission('business:view'), businessesController.getDocuments);
router.delete(
  '/:id/documents/:documentId',
  checkPermission('business:update'),
  businessesController.deleteDocument
);
router.patch(
  '/:id/documents/:documentId/verify',
  checkPermission('business:verify'),
  validateVerifyDocument,
  businessesController.verifyDocument
);

// Members Assignment Sub-routes
router.post(
  '/:id/members',
  checkPermission('business:manage-members'),
  validateMemberAssignment,
  businessesController.addMember
);
router.get('/:id/members', checkPermission('business:view'), businessesController.getMembers);
router.patch(
  '/:id/members/:memberId',
  checkPermission('business:manage-members'),
  validateUpdateMemberRole,
  businessesController.updateMemberRole
);
router.delete(
  '/:id/members/:memberId',
  checkPermission('business:manage-members'),
  businessesController.removeMember
);

export default router;
