import { Router } from 'express';
import cooperativesController from '../controllers/cooperatives.controller.js';
import { validateDefaultCooperatives } from '../validators/cooperatives.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Cooperatives module.
 */
router.get('/', authenticate, cooperativesController.getAll);
router.get('/:id', authenticate, cooperativesController.getById);
router.post('/', authenticate, validateDefaultCooperatives, cooperativesController.create);

export default router;
