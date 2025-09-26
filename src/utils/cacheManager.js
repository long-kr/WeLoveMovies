/**
 * Cache management utilities for the We Love Movies application
 * Provides functions to manage cache operations and statistics
 */

const cache = require("./cache");

/**
 * Clear all cache entries
 */
function clearAllCache() {
  cache.clear();
  return { message: "All cache cleared successfully" };
}

/**
 * Clear cache entries matching a specific pattern
 * @param {string} pattern - Pattern to match (supports wildcard *)
 */
function clearCachePattern(pattern) {
  cache.deletePattern(pattern);
  return { message: `Cache entries matching pattern '${pattern}' cleared successfully` };
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return cache.getStats();
}

/**
 * Clear cache for a specific movie
 * @param {number} movieId - Movie ID
 */
function clearMovieCache(movieId) {
  const patterns = [
    `movies:read:movieId:${movieId}`,
    `movies:theaters:movieId:${movieId}`,
    `movies:reviews:movieId:${movieId}`,
    `movies:list:*`,
  ];

  patterns.forEach((pattern) => cache.deletePattern(pattern));

  return { message: `Cache cleared for movie ${movieId}` };
}

/**
 * Clear cache for a specific review
 * @param {number} reviewId - Review ID
 */
function clearReviewCache(reviewId) {
  const patterns = [
    `reviews:read:review_id:${reviewId}`,
    `reviews:update:reviewId:${reviewId}`,
    `movies:reviews:*`,
  ];

  patterns.forEach((pattern) => cache.deletePattern(pattern));

  return { message: `Cache cleared for review ${reviewId}` };
}

/**
 * Clear all theaters cache
 */
function clearTheatersCache() {
  cache.deletePattern("theaters:list*");
  return { message: "Theaters cache cleared successfully" };
}

/**
 * Warm up cache with frequently accessed data
 * This can be called during application startup
 */
async function warmUpCache() {
  try {
    // Import services
    const moviesService = require("../movies/movies.service");
    const theatersService = require("../theaters/theaters.service");

    // Pre-load some common data
    console.log("Warming up cache...");

    // Load first page of movies
    await moviesService.list({ pagination: { page: 1, limit: 10 } });

    // Load theaters
    await theatersService.list();

    console.log("Cache warmed up successfully");
    return { message: "Cache warmed up successfully" };
  } catch (error) {
    console.error("Error warming up cache:", error);
    return { error: "Failed to warm up cache", details: error.message };
  }
}

/**
 * Health check for cache
 */
function cacheHealthCheck() {
  const stats = cache.getStats();
  const isHealthy = stats.activeEntries >= 0 && stats.totalEntries <= stats.maxSize;

  return {
    healthy: isHealthy,
    stats,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  clearAllCache,
  clearCachePattern,
  getCacheStats,
  clearMovieCache,
  clearReviewCache,
  clearTheatersCache,
  warmUpCache,
  cacheHealthCheck,
};


