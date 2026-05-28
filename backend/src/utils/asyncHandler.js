/**
 * Wraps async Express handlers to automatically forward thrown errors to next().
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware handler function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
