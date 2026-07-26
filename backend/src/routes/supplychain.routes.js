import { Router } from 'express';
import supplychainController from '../controllers/supplychain.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  validateCreateEvent,
  validateUpdateEvent,
  validateUpdateEventStatus,
  validatePostComment,
  validateSearchEvent,
  validateLocation,
  validateAttachment,
} from '../validators/supplychain.validator.js';

const router = Router();

// Apply auth globally to all supply chain routes
router.use(authenticate);

// Event Types Catalog
router.get(
  '/event-types',
  checkPermission('supply-chain:view'),
  supplychainController.getEventTypes
);

// Core Tracing Events CRUD
router.post(
  '/events',
  checkPermission('supply-chain:create'),
  validateCreateEvent,
  supplychainController.create
);
router.get(
  '/events',
  checkPermission('supply-chain:view'),
  validateSearchEvent,
  supplychainController.getAll
);
router.get('/events/:id', checkPermission('supply-chain:view'), supplychainController.getById);
router.patch(
  '/events/:id',
  checkPermission('supply-chain:update'),
  validateUpdateEvent,
  supplychainController.update
);
router.delete('/events/:id', checkPermission('supply-chain:update'), supplychainController.delete);

// Lifecycle Status Locking
router.patch(
  '/events/:id/status',
  checkPermission('supply-chain:lock'),
  validateUpdateEventStatus,
  supplychainController.updateStatus
);

// Geographic Locations
router.post(
  '/events/:id/location',
  checkPermission('supply-chain:update'),
  validateLocation,
  supplychainController.updateLocation
);

// Compliance Attachments
router.post(
  '/events/:id/attachments',
  checkPermission('supply-chain:attachments'),
  uploadSingle('file'),
  validateAttachment,
  supplychainController.addAttachment
);
router.delete(
  '/events/:id/attachments/:attachmentId',
  checkPermission('supply-chain:attachments'),
  supplychainController.deleteAttachment
);

// Comment Threading
router.post(
  '/events/:id/comments',
  checkPermission('supply-chain:comment'),
  validatePostComment,
  supplychainController.postComment
);
router.delete(
  '/events/:id/comments/:commentId',
  checkPermission('supply-chain:comment'),
  supplychainController.deleteComment
);

export default router;
