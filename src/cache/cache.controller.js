/**
 * Cache management controller
 * Provides endpoints for cache administration and monitoring
 */

const cacheManager = require("../utils/cacheManager");

/**
 * Get cache statistics
 */
async function getCacheStats(req, res) {
  try {
    const stats = cacheManager.getCacheStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get cache statistics",
      details: error.message,
    });
  }
}

/**
 * Clear all cache
 */
async function clearAllCache(req, res) {
  try {
    const result = cacheManager.clearAllCache();
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear cache",
      details: error.message,
    });
  }
}

/**
 * Clear cache by pattern
 */
async function clearCachePattern(req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear cache pattern",
      details: error.message,
    });
  }
}

/**
 * Clear cache for specific movie
 */
async function clearMovieCache(req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear movie cache",
      details: error.message,
    });
  }
}

/**
 * Clear cache for specific review
 */
async function clearReviewCache(req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear review cache",
      details: error.message,
    });
  }
}

/**
 * Warm up cache
 */
async function warmUpCache(req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to warm up cache",
      details: error.message,
    });
  }
}

/**
 * Cache health check
 */
async function cacheHealthCheck(req, res) {
  try {
    const health = cacheManager.cacheHealthCheck();

    const statusCode = health.healthy ? 200 : 503;
    res.status(statusCode).json({
      success: health.healthy,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Cache health check failed",
      details: error.message,
    });
  }
}

module.exports = {
  getCacheStats,
  clearAllCache,
  clearCachePattern,
  clearMovieCache,
  clearReviewCache,
  warmUpCache,
  cacheHealthCheck,
};


