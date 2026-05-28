import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateUpdateProfile } from '../validators/users.validator.js';

const router = Router();

/**
 * Users module routes.
 */
router.get('/profile', authenticate, usersController.getProfile);
router.patch('/profile', authenticate, validateUpdateProfile, usersController.updateProfile);

export default router;
