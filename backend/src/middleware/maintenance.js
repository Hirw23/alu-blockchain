import adminService from '../services/admin.service.js';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

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
          const decoded = jwt.verify(token, jwtConfig.secret);
          userRole = decoded.role;
        } catch (err) {
          // Keep role as null on invalid tokens
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
