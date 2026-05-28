import dotenv from 'dotenv';
dotenv.config();

/**
 * JWT configuration parameters for authentication tokens.
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-signing-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-jwt-refresh-signing-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

export default jwtConfig;
