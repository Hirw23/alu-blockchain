/**
 * Parsed pagination options from query parameters.
 * @param {Object} query - Express request query object
 * @returns {Object} Object with limit, offset, and page
 */
export const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

/**
 * Returns formatted pagination metadata.
 * @param {number} totalItems - Total count of records
 * @param {number} page - Current active page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata object
 */
export const formatPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export default {
  getPaginationOptions,
  formatPaginationMeta,
};
