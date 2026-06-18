import validate from '../middleware/validator.js';
import {
  dashboardQuerySchema,
  reportCreateSchema,
  exportRequestSchema,
  reportScheduleSchema,
  trendQuerySchema,
  comparisonQuerySchema,
} from '../schemas/analytics.schema.js';

export const validateDashboardQuery = validate(dashboardQuerySchema, 'query');
export const validateReportCreate = validate(reportCreateSchema, 'body');
export const validateExportRequest = validate(exportRequestSchema, 'body');
export const validateReportSchedule = validate(reportScheduleSchema, 'body');
export const validateTrendQuery = validate(trendQuerySchema, 'query');
export const validateComparisonQuery = validate(comparisonQuerySchema, 'query');

export default {
  validateDashboardQuery,
  validateReportCreate,
  validateExportRequest,
  validateReportSchedule,
  validateTrendQuery,
  validateComparisonQuery,
};
