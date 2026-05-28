import { Router } from 'express';
import blockchainController from '../controllers/blockchain.controller.js';
import { validateDefaultBlockchain } from '../validators/blockchain.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Blockchain module.
 */
router.get('/', authenticate, blockchainController.getAll);
router.get('/:id', authenticate, blockchainController.getById);
router.post('/', authenticate, validateDefaultBlockchain, blockchainController.create);

export default router;
