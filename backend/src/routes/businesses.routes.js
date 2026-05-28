import { Router } from 'express';
import businessesController from '../controllers/businesses.controller.js';
import { validateDefaultBusinesses } from '../validators/businesses.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Businesses module.
 */
router.get('/', authenticate, businessesController.getAll);
router.get('/:id', authenticate, businessesController.getById);
router.post('/', authenticate, validateDefaultBusinesses, businessesController.create);

export default router;
