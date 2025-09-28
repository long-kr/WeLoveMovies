/**
 * Middleware Index
 * Centralized middleware exports
 */

// Error handling middleware
const asyncErrorBoundary = require("./errors/asyncErrorBoundary");
const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const methodNotAllowed = require("./errors/methodNotAllowed");

// Security middleware
const rateLimiter = require("./security/rateLimiter");
const apiKeyAuth = require("./security/apiKeyAuth");

// Validation middleware
const { createValidationMiddleware, validateMoviesQuery, schemas } = require("../lib/validation");

module.exports = {
  // Error handling
  asyncErrorBoundary,
  errorHandler,
  notFound,
  methodNotAllowed,

  // Security
  rateLimiter,
  apiKeyAuth,

  // Validation
  createValidationMiddleware,
  validateMoviesQuery,
  schemas,
};
