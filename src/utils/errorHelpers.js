const { DatabaseError, ValidationError, NotFoundError } = require("../error/CustomError");

/**
 * Safely handle database errors - sanitize messages in production
 * @param {Error} error - The caught error
 * @param {string} fallbackMessage - Safe message for production
 * @returns {DatabaseError} - Sanitized error
 */
function handleDatabaseError(error, fallbackMessage) {
  if (error instanceof DatabaseError) {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      return new DatabaseError(fallbackMessage);
    } else {
      return error; // Keep original error for development
    }
  }
  return new DatabaseError(fallbackMessage);
}

/**
 * Safely handle validation errors - sanitize messages in production
 * @param {Error} error - The caught error
 * @param {string} fallbackMessage - Safe message for production
 * @returns {ValidationError} - Sanitized error
 */
function handleValidationError(error, fallbackMessage) {
  if (error instanceof ValidationError) {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      return new ValidationError(fallbackMessage);
    } else {
      return error; // Keep original error for development
    }
  }
  return new ValidationError(fallbackMessage);
}

/**
 * Safely handle not found errors - sanitize messages in production
 * @param {Error} error - The caught error
 * @param {string} fallbackMessage - Safe message for production
 * @returns {NotFoundError} - Sanitized error
 */
function handleNotFoundError(error, fallbackMessage) {
  if (error instanceof NotFoundError) {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      return new NotFoundError(fallbackMessage);
    } else {
      return error; // Keep original error for development
    }
  }
  return new NotFoundError(fallbackMessage);
}

/**
 * Generic error handler that preserves error types but sanitizes messages in production
 * @param {Error} error - The caught error
 * @param {string} fallbackMessage - Safe message for production
 * @returns {Error} - Sanitized error of the same type
 */
function handleError(error, fallbackMessage) {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    // In production, create a new error of the same type with safe message
    if (error instanceof DatabaseError) {
      return new DatabaseError(fallbackMessage);
    } else if (error instanceof ValidationError) {
      return new ValidationError(fallbackMessage);
    } else if (error instanceof NotFoundError) {
      return new NotFoundError(fallbackMessage);
    } else {
      return new DatabaseError(fallbackMessage);
    }
  } else {
    // In development, preserve original error with full details
    return error;
  }
}

module.exports = {
  handleDatabaseError,
  handleValidationError,
  handleNotFoundError,
  handleError
};

