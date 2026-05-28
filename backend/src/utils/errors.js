/**
 * Base Application Error class extending native Error.
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error description
   * @param {Array} [errors=[]] - Array of validation or structured errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors = []) {
    super(400, message, errors);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errors = []) {
    super(401, message, errors);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errors = []) {
    super(403, message, errors);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', errors = []) {
    super(404, message, errors);
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource Conflict', errors = []) {
    super(409, message, errors);
  }
}

/**
 * 422 Unprocessable Entity / Validation Error
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation Error', errors = []) {
    super(422, message, errors);
  }
}

/**
 * 429 Too Many Requests Error
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too Many Requests', errors = []) {
    super(429, message, errors);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', errors = []) {
    super(500, message, errors);
  }
}
export default {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
};
