import { Router } from 'express';
import qrController from '../controllers/qr.controller.js';
import { validateDefaultQr } from '../validators/qr.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Qr module.
 */
router.get('/', authenticate, qrController.getAll);
router.get('/:id', authenticate, qrController.getById);
router.post('/', authenticate, validateDefaultQr, qrController.create);

export default router;
