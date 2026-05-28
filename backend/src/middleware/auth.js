import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Placeholder authentication middleware.
 * Verifies authorization headers and assigns a mock user object.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // For placeholder purposes, if authorization header is not present, we will inject a default dummy user
  // (Entrepreneur role) to allow exploration, or throw an error if explicitly configured.
  if (!authHeader) {
    // In next phase this will throw UnauthorizedError. For now, we mock.
    req.user = {
      id: 'usr_mock_12345',
      email: 'mock.entrepreneur@example.com',
      role: 'Entrepreneur',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new UnauthorizedError('Invalid authorization token format'));
  }

  // Basic mock token check
  req.user = {
    id: 'usr_mock_12345',
    email: 'mock.user@example.com',
    role: token === 'admin' ? 'PlatformAdmin' : 'Entrepreneur',
  };

  next();
};

/**
 * Placeholder authorization middleware checking user roles.
 * @param {...string} allowedRoles - List of roles permitted to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`User role '${req.user.role}' is not authorized to access this resource`)
      );
    }

    next();
  };
};

export default {
  authenticate,
  authorize,
};
