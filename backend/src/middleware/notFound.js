import { NotFoundError } from '../utils/errors.js';

/**
 * Fallback middleware for non-matching route endpoints (404 Not Found).
 */
export const notFound = (req, res, next) => {
  next(new NotFoundError(`Requested endpoint '${req.originalUrl}' does not exist on this server`));
};

export default notFound;
