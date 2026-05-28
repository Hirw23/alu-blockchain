import { Router } from 'express';
import supplychainController from '../controllers/supplychain.controller.js';
import { validateDefaultSupplychain } from '../validators/supplychain.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Supplychain module.
 */
router.get('/', authenticate, supplychainController.getAll);
router.get('/:id', authenticate, supplychainController.getById);
router.post('/', authenticate, validateDefaultSupplychain, supplychainController.create);

export default router;
