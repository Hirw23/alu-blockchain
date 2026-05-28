import { generateUUID } from '../utils/uuid.js';

/**
 * Express middleware that assigns a unique UUID identifier to each request.
 * Sets the 'X-Request-Id' header in response.
 */
export const requestId = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || generateUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};

export default requestId;
