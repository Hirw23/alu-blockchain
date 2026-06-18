import Joi from 'joi';

export const dashboardQuerySchema = Joi.object({
  dashboardType: Joi.string().valid('ENTREPRENEUR', 'COOPERATIVE', 'ADMIN').optional(),
});

export const reportCreateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  reportType: Joi.string()
    .valid(
      'BUSINESS',
      'PRODUCT',
      'SUPPLY_CHAIN',
      'VERIFICATION',
      'COOPERATIVE',
      'PLATFORM',
      'SYSTEM_ACTIVITY'
    )
    .required(),
  filters: Joi.object().optional().default({}),
});

export const exportRequestSchema = Joi.object({
  format: Joi.string().valid('PDF', 'EXCEL', 'CSV', 'JSON').required(),
});

export const reportScheduleSchema = Joi.object({
  reportDefinitionId: Joi.string().uuid().required(),
  frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
  recipient: Joi.string().email().required(),
  format: Joi.string().valid('PDF', 'EXCEL', 'CSV', 'JSON').required(),
});

export const trendQuerySchema = Joi.object({
  interval: Joi.string()
    .valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')
    .default('DAILY'),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export const comparisonQuerySchema = Joi.object({
  targetIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

export default {
  dashboardQuerySchema,
  reportCreateSchema,
  exportRequestSchema,
  reportScheduleSchema,
  trendQuerySchema,
  comparisonQuerySchema,
};
