/**
 * Application Constants
 * Centralized constants and enums for the application
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Movie Ratings
const MOVIE_RATINGS = {
  G: "G",
  PG: "PG",
  PG_13: "PG-13",
  R: "R",
  NC_17: "NC-17",
};

// Allowed Movie Ratings Array
const ALLOWED_RATINGS = Object.values(MOVIE_RATINGS);

// Sort Orders
const SORT_ORDERS = {
  ASC: "asc",
  DESC: "desc",
};

// Movie Sort Fields
const MOVIE_SORT_FIELDS = {
  TITLE: "title",
  RUNTIME: "runtime_in_minutes",
  RATING: "rating",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

// Allowed Movie Sort Fields Array
const ALLOWED_MOVIE_SORT_FIELDS = Object.values(MOVIE_SORT_FIELDS);

// Cache Key Prefixes
const CACHE_PREFIXES = {
  MOVIES_LIST: "movies:list",
  MOVIES_READ: "movies:read",
  MOVIES_THEATERS: "movies:theaters",
  MOVIES_REVIEWS: "movies:reviews",
  THEATERS_LIST: "theaters:list",
  REVIEWS_READ: "reviews:read",
  REVIEWS_UPDATE: "reviews:update",
  TMDB_POPULAR: "tmdb:popular",
  TMDB_NOW_PLAYING: "tmdb:now_playing",
  TMDB_SEARCH: "tmdb:search",
};

// Error Types
const ERROR_TYPES = {
  VALIDATION_ERROR: "ValidationError",
  NOT_FOUND_ERROR: "NotFoundError",
  DATABASE_ERROR: "DatabaseError",
  FORBIDDEN_ERROR: "ForbiddenError",
  CUSTOM_ERROR: "CustomError",
};

// Database Table Names
const TABLE_NAMES = {
  MOVIES: "movies",
  THEATERS: "theaters",
  CRITICS: "critics",
  REVIEWS: "reviews",
  MOVIES_THEATERS: "movies_theaters",
};

// API Response Messages
const MESSAGES = {
  // Success Messages
  SUCCESS: {
    CACHE_CLEARED: "Cache cleared successfully",
    CACHE_WARMED_UP: "Cache warmed up successfully",
    CACHE_WARMED_UP_FAILED: "Cache warmup failed",
    REVIEW_UPDATED: "Review updated successfully",
    REVIEW_DELETED: "Review deleted successfully",
  },

  // Error Messages
  ERRORS: {
    MOVIE_NOT_FOUND: "Movie cannot be found",
    THEATER_NOT_FOUND: "Theater cannot be found",
    REVIEW_NOT_FOUND: "Review cannot be found",
    CRITIC_NOT_FOUND: "Critic cannot be found",
    VALIDATION_FAILED: "Validation failed",
    DATABASE_ERROR: "Database error occurred",
    INTERNAL_SERVER_ERROR: "Internal server error",
    TOO_MANY_REQUESTS: "Too many requests from this IP, please try again later",
    METHOD_NOT_ALLOWED: "Method not allowed for this route",
    ROUTE_NOT_FOUND: "Route not found",
    TMDB_API_ERROR: "Error fetching data from TMDb API",
    CACHE_WARMUP_FAILED: "Cache warmup failed",
  },
};

// Validation Constraints
const VALIDATION_CONSTRAINTS = {
  REVIEW: {
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 1000,
    SCORE_MIN: 1,
    SCORE_MAX: 5,
  },
  PAGINATION: {
    MIN_PAGE: 1,
    MIN_LIMIT: 1,
    MAX_LIMIT: 50,
    DEFAULT_LIMIT: 10,
  },
  MOVIE: {
    TITLE_MAX_LENGTH: 255,
    MIN_RUNTIME: 0,
  },
};

// TMDb Configuration
const TMDB_CONSTANTS = {
  IMAGE_SIZES: {
    SMALL: "w185",
    MEDIUM: "w300",
    LARGE: "w500",
    ORIGINAL: "original",
  },
  ENDPOINTS: {
    POPULAR: "/movie/popular",
    NOW_PLAYING: "/movie/now_playing",
    SEARCH: "/search/movie",
    MOVIE_DETAILS: "/movie",
  },
};

module.exports = {
  HTTP_STATUS,
  MOVIE_RATINGS,
  ALLOWED_RATINGS,
  SORT_ORDERS,
  MOVIE_SORT_FIELDS,
  ALLOWED_MOVIE_SORT_FIELDS,
  CACHE_PREFIXES,
  ERROR_TYPES,
  TABLE_NAMES,
  MESSAGES,
  VALIDATION_CONSTRAINTS,
  TMDB_CONSTANTS,
};
