import validate from '../middleware/validator.js';
import {
  createCooperativeSchema,
  updateCooperativeSchema,
  bindBusinessSchema,
} from '../schemas/cooperatives.schema.js';

export const validateCreateCooperative = validate(createCooperativeSchema, 'body');
export const validateUpdateCooperative = validate(updateCooperativeSchema, 'body');
export const validateBindBusiness = validate(bindBusinessSchema, 'body');

export default {
  validateCreateCooperative,
  validateUpdateCooperative,
  validateBindBusiness,
};
