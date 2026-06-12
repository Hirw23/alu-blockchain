import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/auth.js';
import productsController from '../controllers/products.controller.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
} from '../validators/products.validator.js';

const router = Router();

// Apply auth globally to all categories routes
router.use(authenticate);

// Tree retrieval (Must be registered before /:id path to prevent parameter collisions)
router.get('/tree', checkPermission('product:view'), productsController.getCategoryTree);

// Core CRUD Endpoints
router.post(
  '/',
  checkPermission('product:manage-categories'),
  validateCreateCategory,
  productsController.createCategory
);
router.get('/', checkPermission('product:view'), productsController.getAllCategories);
router.get('/:id', checkPermission('product:view'), productsController.getCategoryById);
router.patch(
  '/:id',
  checkPermission('product:manage-categories'),
  validateUpdateCategory,
  productsController.updateCategory
);
router.delete(
  '/:id',
  checkPermission('product:manage-categories'),
  productsController.deleteCategory
);

export default router;
