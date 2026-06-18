import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import {
  validateDashboardQuery,
  validateTrendQuery,
  validateComparisonQuery,
} from '../validators/analytics.validator.js';

const router = Router();

// secured dashboards view
router.get(
  '/dashboard',
  authenticate,
  checkPermission('analytics:dashboard'),
  validateDashboardQuery,
  analyticsController.getDashboard
);

router.get(
  '/dashboard/business',
  authenticate,
  checkPermission('analytics:dashboard'),
  analyticsController.getDashboard
);

router.get(
  '/dashboard/cooperative',
  authenticate,
  checkPermission('analytics:dashboard'),
  analyticsController.getDashboard
);

router.get(
  '/dashboard/admin',
  authenticate,
  checkPermission('analytics:dashboard'),
  analyticsController.getDashboard
);

// business metrics
router.get(
  '/business/:id/kpis',
  authenticate,
  checkPermission('analytics:kpis'),
  analyticsController.getBusinessKPIs
);

router.get(
  '/business/:id/trends',
  authenticate,
  checkPermission('analytics:kpis'),
  validateTrendQuery,
  analyticsController.getTrends
);

// products comparison and metrics
router.get(
  '/products/comparison',
  authenticate,
  checkPermission('analytics:comparisons'),
  validateComparisonQuery,
  analyticsController.compareProducts
);

router.get(
  '/products/:id/kpis',
  authenticate,
  checkPermission('analytics:kpis'),
  analyticsController.getProductKPIs
);

// general verification details
router.get(
  '/verifications/geography',
  authenticate,
  checkPermission('analytics:view'),
  analyticsController.getGeographicStats
);

router.get(
  '/verifications/kpis',
  authenticate,
  checkPermission('analytics:kpis'),
  analyticsController.getTrends
);

export default router;
