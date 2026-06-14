import validate from '../middleware/validator.js';
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  postCommentSchema,
  searchEventSchema,
  locationSchema,
  attachmentSchema,
} from '../schemas/supplychain.schema.js';

export const validateCreateEvent = validate(createEventSchema, 'body');
export const validateUpdateEvent = validate(updateEventSchema, 'body');
export const validateUpdateEventStatus = validate(updateEventStatusSchema, 'body');
export const validatePostComment = validate(postCommentSchema, 'body');
export const validateSearchEvent = validate(searchEventSchema, 'query');
export const validateLocation = validate(locationSchema, 'body');
export const validateAttachment = validate(attachmentSchema, 'body');

export default {
  validateCreateEvent,
  validateUpdateEvent,
  validateUpdateEventStatus,
  validatePostComment,
  validateSearchEvent,
  validateLocation,
  validateAttachment,
};
