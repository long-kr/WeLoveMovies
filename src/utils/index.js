// Error handling utilities
const {
  handleDatabaseError,
  handleValidationError,
  handleNotFoundError,
  handleError
} = require("./errorHelpers");

// Query parameter utilities
const {
  buildMoviesQuery,
  parseMoviesQueryParams,
  parseQueryParams,
  sanitizePagination
} = require("./queryHelpers");

// Validation utilities
const {
  createValidationMiddleware,
  validateMoviesQuery,
  schemas
} = require("./validation");

// Other utilities
const mapProperties = require("./map-properties");
const reduceProperties = require("./reduce-properties");

module.exports = {
  // Error handling
  handleDatabaseError,
  handleValidationError,
  handleNotFoundError,
  handleError,
  
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
  reduceProperties
};

