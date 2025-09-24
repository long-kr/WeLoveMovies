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
      schema.required.forEach(field => {
        if (data[field] === undefined || data[field] === null || data[field] === "") {
          errors.push(`${field} is required`);
        }
      });
    }

    // Validate anyOf fields (at least one must be present)
    if (schema.anyOf) {
      const hasAnyRequired = schema.anyOf.some(field =>
        data[field] !== undefined && data[field] !== null && data[field] !== ""
      );

      if (!hasAnyRequired) {
        errors.push(`At least one of these fields must be present: ${schema.anyOf.join(", ")}`);
      }
    }

    // Validate field types and constraints
    if (schema.fields) {
      Object.keys(schema.fields).forEach(field => {
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
      const unknownFields = Object.keys(data).filter(field => !allowedFields.includes(field));
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
 * Common validation schemas
 */
const schemas = {
  reviewUpdate: {
    anyOf: ["content", "score"],  // At least one of these must be present
    fields: {
      content: {
        type: "string",
        minLength: 1,
        maxLength: 1000
      },
      score: {
        type: "number",
        min: 1,
        max: 5,
        integer: true
      }
    },
    strict: true
  }
};

module.exports = {
  createValidationMiddleware,
  schemas
};