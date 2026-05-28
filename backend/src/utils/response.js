/**
 * Formats a successful API response.
 * @param {string} message - User-friendly message
 * @param {Object} [data={}] - Response payload
 * @param {Object} [meta={}] - Meta information like pagination
 * @returns {Object} Standardized success response structure
 */
export const successResponse = (message, data = {}, meta = {}) => {
  return {
    success: true,
    message,
    data,
    meta,
  };
};

/**
 * Formats a failed API response.
 * @param {string} message - Failure reason description
 * @param {Array} [errors=[]] - Array of error items
 * @returns {Object} Standardized failure response structure
 */
export const errorResponse = (message, errors = []) => {
  return {
    success: false,
    message,
    errors,
  };
};

export default {
  success: successResponse,
  error: errorResponse,
};
