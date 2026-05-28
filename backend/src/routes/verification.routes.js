import { Router } from 'express';
import verificationController from '../controllers/verification.controller.js';
import { validateDefaultVerification } from '../validators/verification.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Verification module.
 */
router.get('/', authenticate, verificationController.getAll);
router.get('/:id', authenticate, verificationController.getById);
router.post('/', authenticate, validateDefaultVerification, verificationController.create);

export default router;
