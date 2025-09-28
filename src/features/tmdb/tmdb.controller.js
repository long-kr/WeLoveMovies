const tmdbSyncService = require("./tmdb-sync.service");
const { asyncErrorBoundary } = require("../../middleware");
const { ValidationError } = require("../../middleware/errors/CustomError");

/**
 * Validate sync request parameters
 */
function validateSyncParams(req, res, next) {
  const { listType, pages } = req.body;

  const validListTypes = ["popular", "now_playing", "top_rated", "upcoming"];

  if (listType && !validListTypes.includes(listType)) {
    throw new ValidationError(`Invalid list type. Must be one of: ${validListTypes.join(", ")}`);
  }

  if (pages && (pages < 1 || pages > 10)) {
    throw new ValidationError("Pages must be between 1 and 10");
  }

  return next();
}

/**
 * Validate TMDb ID parameter
 */
function validateTmdbId(req, res, next) {
  const { tmdbId } = req.params;

  if (!tmdbId || isNaN(tmdbId)) {
    throw new ValidationError("Valid TMDb ID is required");
  }

  return next();
}

/**
 * Validate search query
 */
function validateSearchQuery(req, res, next) {
  const { query, maxResults } = req.body;

  if (!query || query.trim().length < 2) {
    throw new ValidationError("Search query must be at least 2 characters long");
  }

  if (maxResults && (maxResults < 1 || maxResults > 50)) {
    throw new ValidationError("Max results must be between 1 and 50");
  }

  return next();
}

/**
 * Sync movies from TMDb
 * POST /api/tmdb/sync
 * Body: { listType?: string, pages?: number }
 */
async function syncMovies(req, res) {
  const { listType = "popular", pages = 1 } = req.body;

  console.log(`Starting TMDb sync: ${listType}, ${pages} page(s)`);

  const results = await tmdbSyncService.syncMovies(listType, pages);

  // Set last sync time
  tmdbSyncService.setLastSyncTime();

  res.status(200).json({
    message: "Movie sync completed",
    data: results,
  });
}

/**
 * Sync specific movie by TMDb ID
 * POST /api/tmdb/sync/:tmdbId
 * Body: { forceUpdate?: boolean }
 */
async function syncMovieById(req, res) {
  const { tmdbId } = req.params;
  const { forceUpdate = false } = req.body;

  console.log(`Syncing movie with TMDb ID: ${tmdbId}, forceUpdate: ${forceUpdate}`);

  const result = await tmdbSyncService.syncMovieById(parseInt(tmdbId, 10), forceUpdate);

  const statusCode = result.action === "inserted" ? 201 : 200;

  res.status(statusCode).json({
    message: result.message,
    action: result.action,
    data: result.movie,
  });
}

/**
 * Search and sync movies
 * POST /api/tmdb/search-sync
 * Body: { query: string, maxResults?: number }
 */
async function searchAndSyncMovies(req, res) {
  const { query, maxResults = 10 } = req.body;

  console.log(`Searching and syncing movies: "${query}", max results: ${maxResults}`);

  const results = await tmdbSyncService.searchAndSyncMovies(query.trim(), maxResults);

  res.status(200).json({
    message: "Search and sync completed",
    query,
    data: results,
  });
}

/**
 * Get sync statistics
 * GET /api/tmdb/stats
 */
async function getSyncStats(req, res) {
  const stats = await tmdbSyncService.getSyncStats();

  res.status(200).json({
    message: "Sync statistics retrieved",
    data: stats,
  });
}

/**
 * Health check for TMDb service
 * GET /api/tmdb/health
 */
async function healthCheck(req, res) {
  const hasApiKey = !!process.env.TMDB_API_KEY;

  res.status(200).json({
    message: "TMDb service health check",
    data: {
      apiKeyConfigured: hasApiKey,
      serviceAvailable: true,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  syncMovies: [validateSyncParams, asyncErrorBoundary(syncMovies)],
  syncMovieById: [validateTmdbId, asyncErrorBoundary(syncMovieById)],
  searchAndSyncMovies: [validateSearchQuery, asyncErrorBoundary(searchAndSyncMovies)],
  getSyncStats: [asyncErrorBoundary(getSyncStats)],
  healthCheck: [asyncErrorBoundary(healthCheck)],
};
