import { ValidationError } from '../utils/errors.js';

/**
 * Express validation middleware builder.
 * @param {Object} schema - Joi Schema to validate against
 * @param {string} [source='body'] - Property of req to validate (body, query, params)
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return next(new ValidationError('Validation Failed', errorDetails));
    }

    // Assign back sanitized value
    req[source] = value;
    next();
  };
};

export default validate;
