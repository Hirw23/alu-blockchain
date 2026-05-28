import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { validateDefaultAnalytics } from '../validators/analytics.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Analytics module.
 */
router.get('/', authenticate, analyticsController.getAll);
router.get('/:id', authenticate, analyticsController.getById);
router.post('/', authenticate, validateDefaultAnalytics, analyticsController.create);

export default router;
