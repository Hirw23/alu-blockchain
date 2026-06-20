import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateUpdateProfile } from '../validators/users.validator.js';

const router = Router();

/**
 * Users module routes.
 */
router.get('/profile', authenticate, usersController.getProfile);
router.patch('/profile', authenticate, validateUpdateProfile, usersController.updateProfile);

// user activity and notifications endpoints
router.get('/me/notifications', authenticate, adminController.getUserNotifications);
router.patch('/me/notifications/:id/read', authenticate, adminController.markNotificationRead);
router.get('/me/activity', authenticate, adminController.getUserActivity);

export default router;
