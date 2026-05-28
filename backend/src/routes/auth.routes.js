import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';

const router = Router();

/**
 * Authentication routes mapping.
 */
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

export default router;
