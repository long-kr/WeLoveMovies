/**
 * Query Parameter Validation
 * Validation middleware for query parameters
 */

const { ValidationError } = require("../../middleware/errors/CustomError");
const { ALLOWED_RATINGS, ALLOWED_MOVIE_SORT_FIELDS, SORT_ORDERS } = require("../../constants");

/**
 * Validate query parameters for movies list endpoint
 * @param {Object} req - Express request object
 * @param {Object} _ - Express response object
 * @param {Function} next - Express next function
 */
function validateMoviesQuery(req, _, next) {
  const errors = [];
  const { query } = req;

  // Validate pagination parameters
  if (query.page && (isNaN(query.page) || parseInt(query.page) < 1)) {
    errors.push("page must be a positive integer");
  }

  if (query.limit && (isNaN(query.limit) || parseInt(query.limit) < 1)) {
    errors.push("limit must be a positive integer");
  }

  // Validate sorting parameters
  if (query.sortBy && !ALLOWED_MOVIE_SORT_FIELDS.includes(query.sortBy)) {
    errors.push(`sortBy must be one of: ${ALLOWED_MOVIE_SORT_FIELDS.join(", ")}`);
  }

  const allowedSortOrders = Object.values(SORT_ORDERS);
  if (query.sortOrder && !allowedSortOrders.includes(query.sortOrder.toLowerCase())) {
    errors.push("sortOrder must be 'asc' or 'desc'");
  }

  // Validate filter parameters
  if (query.title && typeof query.title !== "string") {
    errors.push("title filter must be a string");
  }

  if (query.rating && !ALLOWED_RATINGS.includes(query.rating)) {
    errors.push(`rating must be one of: ${ALLOWED_RATINGS.join(", ")}`);
  }

  if (query.minRuntime && (isNaN(query.minRuntime) || parseInt(query.minRuntime) < 0)) {
    errors.push("minRuntime must be a non-negative number");
  }

  if (query.maxRuntime && (isNaN(query.maxRuntime) || parseInt(query.maxRuntime) < 0)) {
    errors.push("maxRuntime must be a non-negative number");
  }

  if (
    query.minRuntime &&
    query.maxRuntime &&
    parseInt(query.minRuntime) > parseInt(query.maxRuntime)
  ) {
    errors.push("minRuntime cannot be greater than maxRuntime");
  }

  // Validate is_showing parameter
  if (query.is_showing && !["true", "false"].includes(query.is_showing.toLowerCase())) {
    errors.push("is_showing must be 'true' or 'false'");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join("; "));
  }

  next();
}

module.exports = {
  validateMoviesQuery,
};
