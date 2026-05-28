import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import { validateDefaultAdmin } from '../validators/admin.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Admin module.
 */
router.get('/', authenticate, adminController.getAll);
router.get('/:id', authenticate, adminController.getById);
router.post('/', authenticate, validateDefaultAdmin, adminController.create);

export default router;
