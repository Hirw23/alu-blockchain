import validate from '../middleware/validator.js';
import { defaultNotificationsSchema } from '../schemas/notifications.schema.js';

/**
 * Default validator middleware for Notifications requests.
 */
export const validateDefaultNotifications = validate(defaultNotificationsSchema, 'body');

export default {
  validateDefaultNotifications,
};
