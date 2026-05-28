import { Router } from 'express';
import productsController from '../controllers/products.controller.js';
import { validateDefaultProducts } from '../validators/products.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Products module.
 */
router.get('/', authenticate, productsController.getAll);
router.get('/:id', authenticate, productsController.getById);
router.post('/', authenticate, validateDefaultProducts, productsController.create);

export default router;
