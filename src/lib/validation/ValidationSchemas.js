/**
 * Validation Schemas
 * Predefined validation schemas for common use cases
 */

const { VALIDATION_CONSTRAINTS } = require("../../constants");

/**
 * Common validation schemas
 */
const schemas = {
  reviewUpdate: {
    anyOf: ["content", "score"], // At least one of these must be present
    fields: {
      content: {
        type: "string",
        minLength: VALIDATION_CONSTRAINTS.REVIEW.CONTENT_MIN_LENGTH,
        maxLength: VALIDATION_CONSTRAINTS.REVIEW.CONTENT_MAX_LENGTH,
      },
      score: {
        type: "number",
        min: VALIDATION_CONSTRAINTS.REVIEW.SCORE_MIN,
        max: VALIDATION_CONSTRAINTS.REVIEW.SCORE_MAX,
        integer: true,
      },
    },
    strict: true,
  },

  movieCreate: {
    required: ["title", "runtime_in_minutes", "rating"],
    fields: {
      title: {
        type: "string",
        minLength: 1,
        maxLength: VALIDATION_CONSTRAINTS.MOVIE.TITLE_MAX_LENGTH,
      },
      runtime_in_minutes: {
        type: "number",
        min: VALIDATION_CONSTRAINTS.MOVIE.MIN_RUNTIME,
        integer: true,
      },
      rating: {
        type: "string",
        validate: (value) => {
          const { ALLOWED_RATINGS } = require("../../constants");
          return ALLOWED_RATINGS.includes(value);
        },
        message: "Rating must be one of: G, PG, PG-13, R, NC-17",
      },
      description: {
        type: "string",
        maxLength: 1000,
      },
      image_url: {
        type: "string",
        pattern: /^https?:\/\/.+/,
        message: "Image URL must be a valid HTTP/HTTPS URL",
      },
    },
    strict: true,
  },

  movieUpdate: {
    anyOf: ["title", "runtime_in_minutes", "rating", "description", "image_url"],
    fields: {
      title: {
        type: "string",
        minLength: 1,
        maxLength: VALIDATION_CONSTRAINTS.MOVIE.TITLE_MAX_LENGTH,
      },
      runtime_in_minutes: {
        type: "number",
        min: VALIDATION_CONSTRAINTS.MOVIE.MIN_RUNTIME,
        integer: true,
      },
      rating: {
        type: "string",
        validate: (value) => {
          const { ALLOWED_RATINGS } = require("../../constants");
          return ALLOWED_RATINGS.includes(value);
        },
        message: "Rating must be one of: G, PG, PG-13, R, NC-17",
      },
      description: {
        type: "string",
        maxLength: 1000,
      },
      image_url: {
        type: "string",
        pattern: /^https?:\/\/.+/,
        message: "Image URL must be a valid HTTP/HTTPS URL",
      },
    },
    strict: true,
  },
};

module.exports = {
  schemas,
};
