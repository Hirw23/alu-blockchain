import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

/**
 * Signs a new Access JWT Token.
 * @param {Object} payload - User properties to embed in the token
 * @returns {string} Signed access token string
 */
export const signAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * Signs a new Refresh JWT Token.
 * @param {Object} payload - User properties to embed in the token
 * @returns {string} Signed refresh token string
 */
export const signRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

/**
 * Verifies an Access JWT Token against our secret.
 * @param {string} token - Signed token
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};

/**
 * Verifies a Refresh JWT Token against our secret.
 * @param {string} token - Signed token
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshSecret);
};

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
