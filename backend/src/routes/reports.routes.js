import { Router } from 'express';
import reportsController from '../controllers/reports.controller.js';
import { validateDefaultReports } from '../validators/reports.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Reports module.
 */
router.get('/', authenticate, reportsController.getAll);
router.get('/:id', authenticate, reportsController.getById);
router.post('/', authenticate, validateDefaultReports, reportsController.create);

export default router;
