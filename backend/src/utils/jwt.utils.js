import crypto from 'crypto';
import jwtConfig from '../config/jwt.js';

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const parseExpiresIn = (input) => {
  if (typeof input === 'number') {
    return input;
  }

  const match = String(input || '0').trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return Number(input) || 0;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  return amount * multipliers[unit];
};

const signToken = (payload, secret, expiresIn) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    iat: now,
    exp: now + parseExpiresIn(expiresIn),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(unsignedToken).digest('base64url');

  return `${unsignedToken}.${signature}`;
};

const verifyToken = (token, secret) => {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    throw error;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(unsignedToken)
    .digest('base64url');

  if (signature !== expectedSignature) {
    const error = new Error('Invalid token signature');
    error.name = 'JsonWebTokenError';
    throw error;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
    const error = new Error('jwt expired');
    error.name = 'TokenExpiredError';
    throw error;
  }

  return payload;
};

/**
 * Signs a new Access JWT Token.
 * @param {Object} payload - User properties to embed in the token
 * @returns {string} Signed access token string
 */
export const signAccessToken = (payload) => {
  return signToken(payload, jwtConfig.secret, jwtConfig.expiresIn);
};

/**
 * Signs a new Refresh JWT Token.
 * @param {Object} payload - User properties to embed in the token
 * @returns {string} Signed refresh token string
 */
export const signRefreshToken = (payload) => {
  return signToken(payload, jwtConfig.refreshSecret, jwtConfig.refreshExpiresIn);
};

/**
 * Verifies an Access JWT Token against our secret.
 * @param {string} token - Signed token
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  return verifyToken(token, jwtConfig.secret);
};

/**
 * Verifies a Refresh JWT Token against our secret.
 * @param {string} token - Signed token
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  return verifyToken(token, jwtConfig.refreshSecret);
};

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
