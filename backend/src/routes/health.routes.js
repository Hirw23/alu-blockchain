import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';

const router = Router();

router.get('/', adminController.getSystemHealth);
router.get('/details', adminController.getSystemHealth);

export default router;
