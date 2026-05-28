import appConfig from '../config/app.js';
import { errorResponse } from '../utils/response.js';

/**
 * Global Express Error Handling Middleware.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  // Log error details
  console.error(
    `[Error] Request ID: ${req.id || 'N/A'} | Status: ${statusCode} | Message: ${message}`
  );
  if (statusCode === 500 || err.stack) {
    console.error(err.stack);
  }

  // Build error response payload
  const payload = errorResponse(message, errors);

  // In development, append stack trace for easier debugging
  if (appConfig.isDevelopment) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

export default errorHandler;
