// Query parameter utilities
const {
  buildMoviesQuery,
  parseMoviesQueryParams,
  parseQueryParams,
  sanitizePagination,
} = require("./queryHelpers");

// Validation utilities
const { createValidationMiddleware, validateMoviesQuery, schemas } = require("./validation");

// Other utilities
const mapProperties = require("./map-properties");
const reduceProperties = require("./reduce-properties");

module.exports = {
  // Query helpers
  buildMoviesQuery,
  parseMoviesQueryParams,
  parseQueryParams,
  sanitizePagination,

  // Validation
  createValidationMiddleware,
  validateMoviesQuery,
  schemas,

  // Data transformation
  mapProperties,
  reduceProperties,
};
