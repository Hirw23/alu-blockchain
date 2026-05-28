import Joi from 'joi';

/**
 * Default validation schema for Notifications.
 */
export const defaultNotificationsSchema = Joi.object({
  name: Joi.string().optional(),
});

export default {
  defaultNotificationsSchema,
};
