import { verifyAccessToken } from '../utils/jwt.utils.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { prisma } from '../database/client.js';

/**
 * Middleware that authenticates request calls using Bearer JWT tokens.
 * Loads user details and permissions list into the request context.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Access token is missing or invalid'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Access token has expired'));
      }
      return next(new UnauthorizedError('Invalid access token'));
    }

    // Retrieve active user along with roles and granular permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return next(new UnauthorizedError('User account not found'));
    }

    if (user.status !== 'ACTIVE') {
      return next(new ForbiddenError('User account is currently deactivated'));
    }

    // Flatten user details and permissions list
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      emailVerified: user.emailVerified,
      permissions: user.role.permissions.map((rp) => rp.permission.name),
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware that restricts route calls to specific Roles.
 * @param {...string} allowedRoles - Role labels permitted to pass
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

/**
 * Middleware that restricts route calls to specific granular Permissions.
 * @param {string} requiredPermission - Permission string (e.g. 'users:delete')
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    // PlatformAdmin bypasses all permission checks automatically
    if (req.user.role === 'PlatformAdmin') {
      return next();
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return next(
        new ForbiddenError(
          `You do not have the required permission '${requiredPermission}' to perform this action`
        )
      );
    }

    next();
  };
};

export default {
  authenticate,
  authorize,
  checkPermission,
};
