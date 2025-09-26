const { ValidationError } = require("../error/CustomError");

/**
 * @typedef {Object.<string, any>} Data
 */

/**
 * @typedef {Object} Request
 * @property {Object} body - Request body
 * @property {Data} [body.data] - Request data
 */

/**
 * @typedef {Object} Response
 */

/**
 * @typedef {Function} NextFunction
 * @param {Error} [error] - Error to pass to next middleware
 */

/**
 * @typedef {Object} ValidationRule
 * @property {string} [type] - The expected type of the value
 * @property {number} [min] - Minimum value for numbers
 * @property {number} [max] - Maximum value for numbers
 * @property {boolean} [integer] - Whether the number must be an integer
 * @property {number} [minLength] - Minimum length for strings
 * @property {number} [maxLength] - Maximum length for strings
 * @property {RegExp} [pattern] - Regular expression pattern for strings
 * @property {(value: any) => boolean} [validate] - Custom validation function
 * @property {string} [message] - Custom error message
 */

/**
 * @typedef {Object} ValidationSchema
 * @property {string[]} [required] - List of required fields
 * @property {string[]} [anyOf] - List of fields where at least one must be present
 * @property {Object.<string, ValidationRule>} [fields] - Validation rules for each field
 * @property {boolean} [strict] - Whether to disallow unknown fields
 */

/**
 * Creates a validation schema for request data
 * @param {ValidationSchema} schema - The validation schema configuration
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Middleware function for validation
 */
function createValidationMiddleware(schema) {
  return (req, res, next) => {
    const errors = [];
    const { data } = req.body;

    if (!data) {
      throw new ValidationError("Request body must include data object");
    }

    // Validate required fields
    if (schema.required) {
      schema.required.forEach((field) => {
        if (data[field] === undefined || data[field] === null || data[field] === "") {
          errors.push(`${field} is required`);
        }
      });
    }

    // Validate anyOf fields (at least one must be present)
    if (schema.anyOf) {
      const hasAnyRequired = schema.anyOf.some(
        (field) => data[field] !== undefined && data[field] !== null && data[field] !== ""
      );

      if (!hasAnyRequired) {
        errors.push(`At least one of these fields must be present: ${schema.anyOf.join(", ")}`);
      }
    }

    // Validate field types and constraints
    if (schema.fields) {
      Object.keys(schema.fields).forEach((field) => {
        const value = data[field];
        const rules = schema.fields?.[field] || {};

        if (value !== undefined) {
          // Type validation
          if (rules.type && typeof value !== rules.type) {
            errors.push(`${field} must be of type ${rules.type}`);
          }

          // Number range validation
          if (rules.type === "number" && typeof value === "number") {
            if (rules.min !== undefined && value < rules.min) {
              errors.push(`${field} must be greater than or equal to ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
              errors.push(`${field} must be less than or equal to ${rules.max}`);
            }
            if (rules.integer && !Number.isInteger(value)) {
              errors.push(`${field} must be an integer`);
            }
          }

          // String length validation
          if (rules.type === "string" && typeof value === "string") {
            if (rules.minLength && value.length < rules.minLength) {
              errors.push(`${field} must be at least ${rules.minLength} characters long`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
              errors.push(`${field} must be at most ${rules.maxLength} characters long`);
            }
          }

          // Pattern validation
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
          }

          // Custom validation
          if (rules.validate) {
            try {
              const isValid = rules.validate(value);
              if (!isValid) {
                errors.push(rules.message || `${field} is invalid`);
              }
            } catch (err) {
              errors.push(err instanceof Error ? err.message : "Validation error");
            }
          }
        }
      });
    }

    // Validate for unknown fields
    if (schema.strict) {
      const allowedFields = [...(schema.required || []), ...Object.keys(schema.fields || {})];
      const unknownFields = Object.keys(data).filter((field) => !allowedFields.includes(field));
      if (unknownFields.length > 0) {
        errors.push(`Unknown field(s): ${unknownFields.join(", ")}`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join("; "), schema.anyOf);
    }

    next();
  };
}

/**
 * Validate query parameters for movies list endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validateMoviesQuery(req, res, next) {
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
  const allowedSortFields = ["title", "runtime_in_minutes", "rating", "created_at", "updated_at"];
  if (query.sortBy && !allowedSortFields.includes(query.sortBy)) {
    errors.push(`sortBy must be one of: ${allowedSortFields.join(", ")}`);
  }

  const allowedSortOrders = ["asc", "desc"];
  if (query.sortOrder && !allowedSortOrders.includes(query.sortOrder.toLowerCase())) {
    errors.push("sortOrder must be 'asc' or 'desc'");
  }

  // Validate filter parameters
  if (query.title && typeof query.title !== "string") {
    errors.push("title filter must be a string");
  }

  const allowedRatings = ["G", "PG", "PG-13", "R", "NC-17"];
  if (query.rating && !allowedRatings.includes(query.rating)) {
    errors.push(`rating must be one of: ${allowedRatings.join(", ")}`);
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

/**
 * Common validation schemas
 */
const schemas = {
  reviewUpdate: {
    anyOf: ["content", "score"], // At least one of these must be present
    fields: {
      content: {
        type: "string",
        minLength: 1,
        maxLength: 1000,
      },
      score: {
        type: "number",
        min: 1,
        max: 5,
        integer: true,
      },
    },
    strict: true,
  },
};

module.exports = {
  createValidationMiddleware,
  validateMoviesQuery,
  schemas,
};
