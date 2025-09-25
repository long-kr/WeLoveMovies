const knex = require("../db/connection");

/**
 * Build query with filters and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination options
 * @param {boolean} isShowing - Whether to filter by showing status
 * @returns {Object} - Query builder and total count promise
 */
function buildMoviesQuery(filters = {}, pagination = {}, isShowing = false) {
  let query;
  
  if (isShowing) {
    // For showing movies, we need to join with movies_theaters
    query = knex("movies as m")
      .join("movies_theaters as mt", "m.movie_id", "mt.movie_id")
      .select("m.*", "mt.is_showing")
      .where({ "mt.is_showing": true })
      .groupBy("m.movie_id", "m.title", "m.runtime_in_minutes", "m.rating", "m.description", "m.image_url", "m.created_at", "m.updated_at", "mt.is_showing");
  } else {
    query = knex("movies as m").select("*");
  }

  // Apply filters
  if (filters.title) {
    query = query.where("m.title", "ilike", `%${filters.title}%`);
  }

  if (filters.rating) {
    query = query.where("m.rating", "=", filters.rating);
  }

  if (filters.minRuntime) {
    query = query.where("m.runtime_in_minutes", ">=", filters.minRuntime);
  }

  if (filters.maxRuntime) {
    query = query.where("m.runtime_in_minutes", "<=", filters.maxRuntime);
  }

  if (filters.year) {
    query = query.where(knex.raw("EXTRACT(YEAR FROM m.created_at)"), "=", filters.year);
  }

  // Apply sorting
  const sortBy = pagination.sortBy || "title";
  const sortOrder = pagination.sortOrder || "asc";
  
  // Validate sortBy to prevent SQL injection
  const allowedSortFields = ["title", "runtime_in_minutes", "rating", "created_at", "updated_at"];
  if (allowedSortFields.includes(sortBy)) {
    query = query.orderBy(sortBy, sortOrder);
  } else {
    query = query.orderBy("title", "asc");
  }

  // Create a copy for counting (without pagination)
  const countQuery = query.clone().clearSelect().clearOrder().count("* as count");

  // Apply pagination
  if (pagination.limit) {
    query = query.limit(pagination.limit);
  }

  if (pagination.offset) {
    query = query.offset(pagination.offset);
  }

  return {
    query,
    countQuery
  };
}


/**
 * Parse query parameters into filters and pagination options for movies
 * @param {Object} query - Request query object
 * @returns {Object} - Parsed filters and pagination options
 */
function parseMoviesQueryParams(query) {
  const filters = {};
  const pagination = {};

  // Parse filters
  if (query.title) filters.title = query.title;
  if (query.rating) filters.rating = query.rating;
  if (query.minRuntime) filters.minRuntime = parseInt(query.minRuntime);
  if (query.maxRuntime) filters.maxRuntime = parseInt(query.maxRuntime);
  if (query.year) filters.year = parseInt(query.year);

  // Parse pagination
  if (query.page) pagination.page = parseInt(query.page);
  if (query.limit) pagination.limit = parseInt(query.limit);
  if (query.sortBy) pagination.sortBy = query.sortBy;
  if (query.sortOrder) pagination.sortOrder = query.sortOrder.toLowerCase();

  return { filters, pagination };
}

/**
 * Generic query parameter parser that can be extended for different resources
 * @param {Object} query - Request query object
 * @param {Object} options - Configuration options
 * @returns {Object} - Parsed filters and pagination options
 */
function parseQueryParams(query, options = {}) {
  const {
    allowedFilters = [],
    allowedSortFields = [],
    defaultSortBy = "id",
    defaultSortOrder = "asc"
  } = options;

  const filters = {};
  const pagination = {};

  // Parse filters based on allowed filters
  allowedFilters.forEach(filter => {
    if (query[filter]) {
      if (filter.includes("Runtime") || filter.includes("year") || filter.includes("page") || filter.includes("limit")) {
        filters[filter] = parseInt(query[filter]);
      } else {
        filters[filter] = query[filter];
      }
    }
  });

  // Parse pagination
  if (query.page) pagination.page = parseInt(query.page);
  if (query.limit) pagination.limit = parseInt(query.limit);
  
  // Parse sorting
  if (query.sortBy && allowedSortFields.includes(query.sortBy)) {
    pagination.sortBy = query.sortBy;
  } else {
    pagination.sortBy = defaultSortBy;
  }
  
  if (query.sortOrder && ["asc", "desc"].includes(query.sortOrder.toLowerCase())) {
    pagination.sortOrder = query.sortOrder.toLowerCase();
  } else {
    pagination.sortOrder = defaultSortOrder;
  }

  return { filters, pagination };
}

/**
 * Validate and sanitize pagination parameters
 * @param {Object} pagination - Pagination object
 * @param {Object} options - Configuration options
 * @returns {Object} - Sanitized pagination object
 */
function sanitizePagination(pagination, options = {}) {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 50,
    minLimit = 1
  } = options;

  const page = Math.max(1, parseInt(pagination.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(minLimit, parseInt(pagination.limit) || defaultLimit));
  
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

module.exports = {
  buildMoviesQuery,
  parseMoviesQueryParams,
  parseQueryParams,
  sanitizePagination
};

