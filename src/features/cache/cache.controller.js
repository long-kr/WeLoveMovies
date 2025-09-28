/**
 * Cache management controller
 * Provides endpoints for cache administration and monitoring
 */

const { cacheManager } = require("../../lib/cache");

/**
 * Get cache statistics
 */
async function getCacheStats(_, res) {
  const stats = cacheManager.getCacheStats();
  res.json({
    success: true,
    data: stats,
  });
}

/**
 * Get cache keys
 */
async function getCacheKeys(_, res) {
  const keys = cacheManager.getCacheKeys();
  res.json({
    success: true,
    data: keys,
  });
}

/**
 * Clear all cache
 */
async function clearAllCache(_, res) {
  const result = cacheManager.clearAllCache();
  res.json({
    success: true,
    message: result.message,
  });
}

/**
 * Clear cache by pattern
 */
async function clearCachePattern(req, res) {
  const { pattern } = req.params;

  if (!pattern) {
    return res.status(400).json({
      success: false,
      error: "Pattern parameter is required",
    });
  }

  const result = cacheManager.clearCachePattern(pattern);
  res.json({
    success: true,
    message: result.message,
  });
}

/**
 * Clear cache for specific movie
 */
async function clearMovieCache(req, res) {
  const { movieId } = req.params;

  if (!movieId) {
    return res.status(400).json({
      success: false,
      error: "Movie ID parameter is required",
    });
  }

  const result = cacheManager.clearMovieCache(movieId);
  res.json({
    success: true,
    message: result.message,
  });
}

/**
 * Clear cache for specific review
 */
async function clearReviewCache(req, res) {
  const { reviewId } = req.params;

  if (!reviewId) {
    return res.status(400).json({
      success: false,
      error: "Review ID parameter is required",
    });
  }

  const result = cacheManager.clearReviewCache(reviewId);
  res.json({
    success: true,
    message: result.message,
  });
}

/**
 * Warm up cache
 */
async function warmUpCache(_, res) {
  const result = await cacheManager.warmUpCache();

  if (result.error) {
    return res.status(500).json({
      success: false,
      error: result.error,
      details: result.details,
    });
  }

  res.json({
    success: true,
    message: result.message,
  });
}

/**
 * Cache health check
 */
async function cacheHealthCheck(_, res) {
  const health = cacheManager.cacheHealthCheck();

  const statusCode = health.healthy ? 200 : 503;
  res.status(statusCode).json({
    success: health.healthy,
    data: health,
  });
}

module.exports = {
  getCacheStats,
  getCacheKeys,
  clearAllCache,
  clearCachePattern,
  clearMovieCache,
  clearReviewCache,
  warmUpCache,
  cacheHealthCheck,
};
