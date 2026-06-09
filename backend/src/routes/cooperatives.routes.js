import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/auth.js';
import cooperativesController from '../controllers/cooperatives.controller.js';
import {
  validateCreateCooperative,
  validateUpdateCooperative,
  validateBindBusiness,
} from '../validators/cooperatives.validator.js';

const router = Router();

// Apply auth globally to all cooperatives routes
router.use(authenticate);

// Cooperative CRUD Endpoints
router.post(
  '/',
  checkPermission('cooperative:create'),
  validateCreateCooperative,
  cooperativesController.create
);
router.get('/', checkPermission('cooperative:view'), cooperativesController.getAll);
router.get('/:id', checkPermission('cooperative:view'), cooperativesController.getById);
router.patch(
  '/:id',
  checkPermission('cooperative:update'),
  validateUpdateCooperative,
  cooperativesController.update
);
router.delete('/:id', checkPermission('cooperative:manage'), cooperativesController.delete);

// Cooperative-Business relationship routes
router.get(
  '/:id/businesses',
  checkPermission('cooperative:view'),
  cooperativesController.getBusinesses
);
router.post(
  '/:id/businesses',
  checkPermission('cooperative:manage'),
  validateBindBusiness,
  cooperativesController.addBusiness
);
router.delete(
  '/:id/businesses/:businessId',
  checkPermission('cooperative:manage'),
  cooperativesController.removeBusiness
);

export default router;
