import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import productsController from '../controllers/products.controller.js';
import supplychainController from '../controllers/supplychain.controller.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateVariant,
  validateUpdateVariant,
  validateImageMetadata,
  validateProductDocument,
  validateUpdateInventory,
  validateUpdateProductStatus,
  validateSearchProduct,
} from '../validators/products.validator.js';

const router = Router();

// Apply auth globally to all products routes
router.use(authenticate);

// Core Product CRUD & Searches
router.post(
  '/',
  checkPermission('product:create'),
  validateCreateProduct,
  productsController.create
);
router.get('/', checkPermission('product:view'), validateSearchProduct, productsController.getAll);
router.get('/me', checkPermission('product:view'), productsController.getMe);
router.get(
  '/search',
  checkPermission('product:view'),
  validateSearchProduct,
  productsController.getAll
); // Alias as per spec
router.get('/:id', checkPermission('product:view'), productsController.getById);
router.patch(
  '/:id',
  checkPermission('product:update'),
  validateUpdateProduct,
  productsController.update
);
router.delete('/:id', checkPermission('product:delete'), productsController.delete);

router.patch(
  '/:id/status',
  checkPermission('product:archive'),
  validateUpdateProductStatus,
  productsController.updateStatus
);
router.patch(
  '/:id/inventory',
  checkPermission('product:update'),
  validateUpdateInventory,
  productsController.updateInventory
);
router.get(
  '/:id/statistics',
  checkPermission('product:view-statistics'),
  productsController.getStatistics
);
router.get('/:id/timeline', checkPermission('product:view'), supplychainController.getTimeline);
router.get(
  '/:id/current-stage',
  checkPermission('product:view'),
  supplychainController.getCurrentStage
);
router.get('/:id/history', checkPermission('product:view'), supplychainController.getTimeline);

// Variants Sub-routes
router.post(
  '/:id/variants',
  checkPermission('product:update'),
  validateCreateVariant,
  productsController.addVariant
);
router.get('/:id/variants', checkPermission('product:view'), productsController.getVariants);
router.patch(
  '/:id/variants/:variantId',
  checkPermission('product:update'),
  validateUpdateVariant,
  productsController.updateVariant
);
router.delete(
  '/:id/variants/:variantId',
  checkPermission('product:update'),
  productsController.deleteVariant
);

// Images Sub-routes
router.post(
  '/:id/images',
  checkPermission('product:manage-images'),
  uploadSingle('file'),
  validateImageMetadata,
  productsController.addImage
);
router.get('/:id/images', checkPermission('product:view'), productsController.getImages);
router.delete(
  '/:id/images/:imageId',
  checkPermission('product:manage-images'),
  productsController.deleteImage
);
router.patch(
  '/:id/images/:imageId/order',
  checkPermission('product:manage-images'),
  productsController.updateImageOrder
);

// Documents Sub-routes
router.post(
  '/:id/documents',
  checkPermission('product:manage-documents'),
  uploadSingle('file'),
  validateProductDocument,
  productsController.addDocument
);
router.get('/:id/documents', checkPermission('product:view'), productsController.getDocuments);
router.delete(
  '/:id/documents/:documentId',
  checkPermission('product:manage-documents'),
  productsController.deleteDocument
);

export default router;
