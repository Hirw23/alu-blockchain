import { Router } from 'express';
import reportsController from '../controllers/reports.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import {
  validateReportCreate,
  validateExportRequest,
  validateReportSchedule,
} from '../validators/analytics.validator.js';

const router = Router();

// secured reports definitions
router.post(
  '/',
  authenticate,
  checkPermission('reports:create'),
  validateReportCreate,
  reportsController.createDefinition
);

router.get(
  '/',
  authenticate,
  checkPermission('analytics:reports'),
  reportsController.getDefinitions
);

router.get(
  '/:id',
  authenticate,
  checkPermission('analytics:reports'),
  reportsController.getDefinition
);

router.delete(
  '/:id',
  authenticate,
  checkPermission('reports:manage'),
  reportsController.deleteDefinition
);

// secured report export actions & history downloads
router.post(
  '/:id/export',
  authenticate,
  checkPermission('analytics:exports'),
  validateExportRequest,
  reportsController.exportReport
);

router.get(
  '/:id/download',
  authenticate,
  checkPermission('reports:download'),
  reportsController.downloadReport
);

router.get(
  '/:id/history',
  authenticate,
  checkPermission('analytics:exports'),
  reportsController.getExportHistory
);

// scheduled reports contracts
router.post(
  '/schedules',
  authenticate,
  checkPermission('reports:manage'),
  validateReportSchedule,
  reportsController.createSchedule
);

router.get(
  '/schedules',
  authenticate,
  checkPermission('reports:manage'),
  reportsController.getSchedules
);

router.patch(
  '/schedules/:id',
  authenticate,
  checkPermission('reports:manage'),
  reportsController.updateSchedule
);

router.delete(
  '/schedules/:id',
  authenticate,
  checkPermission('reports:manage'),
  reportsController.deleteSchedule
);

export default router;
