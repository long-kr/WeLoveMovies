const { VALIDATION_CONSTRAINTS } = require("../../constants");

/**
 * Validate and sanitize pagination parameters
 * @param {Object} pagination - Pagination object
 * @param {Object} options - Configuration options
 * @returns {Object} - Sanitized pagination object
 */
function sanitizePagination(pagination, options = {}) {
  const {
    defaultPage = VALIDATION_CONSTRAINTS.PAGINATION.MIN_PAGE,
    defaultLimit = VALIDATION_CONSTRAINTS.PAGINATION.DEFAULT_LIMIT,
    maxLimit = VALIDATION_CONSTRAINTS.PAGINATION.MAX_LIMIT,
    minLimit = VALIDATION_CONSTRAINTS.PAGINATION.MIN_LIMIT,
  } = options;

  const page = Math.max(1, parseInt(pagination.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(minLimit, parseInt(pagination.limit) || defaultLimit));

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

/**
 * Create pagination metadata for responses
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalCount - Total number of items
 * @returns {Object} - Pagination metadata
 */
function createPaginationMeta(page, limit, totalCount) {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}

module.exports = {
  sanitizePagination,
  createPaginationMeta,
};
