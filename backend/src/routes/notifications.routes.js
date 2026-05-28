import { Router } from 'express';
import notificationsController from '../controllers/notifications.controller.js';
import { validateDefaultNotifications } from '../validators/notifications.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Routes mappings for the Notifications module.
 */
router.get('/', authenticate, notificationsController.getAll);
router.get('/:id', authenticate, notificationsController.getById);
router.post('/', authenticate, validateDefaultNotifications, notificationsController.create);

export default router;
