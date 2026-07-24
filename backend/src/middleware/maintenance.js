import adminService from '../services/admin.service.js';
import { verifyAccessToken } from '../utils/jwt.utils.js';

export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const isMaintenanceActive = await adminService.isMaintenanceModeActive();
    if (isMaintenanceActive) {
      // Extract and verify token to see if actor has PlatformAdmin privileges
      let userRole = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = verifyAccessToken(token);
          userRole = decoded.role;
        } catch (err) {
          console.error('Maintenance JWT verification failed:', err.message);
        }
      }

      if (userRole === 'PlatformAdmin') {
        return next();
      }

      return res.status(503).json({
        success: false,
        message: 'System is currently undergoing scheduled maintenance. Please try again later.',
      });
    }
  } catch (err) {
    console.error('Maintenance mode verification error:', err.message);
  }
  next();
};

export default checkMaintenanceMode;
