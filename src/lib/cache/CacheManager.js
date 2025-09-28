/**
 * Cache management utilities for the We Love Movies application
 * Provides functions to manage cache operations and statistics
 */

const { CACHE_PREFIXES, MESSAGES } = require("../../constants");

class CacheManager {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Clear all cache entries
   */
  clearAllCache() {
    this.cache.clear();
    return { message: MESSAGES.SUCCESS.CACHE_CLEARED };
  }

  /**
   * Clear cache entries matching a specific pattern
   * @param {string} pattern - Pattern to match (supports wildcard *)
   */
  clearCachePattern(pattern) {
    this.cache.deletePattern(pattern);
    return { message: `Cache entries matching pattern '${pattern}' cleared successfully` };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get cache keys
   */
  getCacheKeys() {
    return this.cache.getKeys();
  }

  /**
   * Clear cache for a specific movie
   * @param {number} movieId - Movie ID
   */
  clearMovieCache(movieId) {
    const patterns = [
      `${CACHE_PREFIXES.MOVIES_READ}:movieId:${movieId}`,
      `${CACHE_PREFIXES.MOVIES_THEATERS}:movieId:${movieId}`,
      `${CACHE_PREFIXES.MOVIES_REVIEWS}:movieId:${movieId}`,
      `${CACHE_PREFIXES.MOVIES_LIST}:*`,
    ];

    patterns.forEach((pattern) => this.cache.deletePattern(pattern));

    return { message: `Cache cleared for movie ${movieId}` };
  }

  /**
   * Clear cache for a specific review
   * @param {number} reviewId - Review ID
   */
  clearReviewCache(reviewId) {
    const patterns = [
      `${CACHE_PREFIXES.REVIEWS_READ}:review_id:${reviewId}`,
      `${CACHE_PREFIXES.REVIEWS_UPDATE}:reviewId:${reviewId}`,
      `${CACHE_PREFIXES.MOVIES_REVIEWS}:*`,
    ];

    patterns.forEach((pattern) => this.cache.deletePattern(pattern));

    return { message: `Cache cleared for review ${reviewId}` };
  }

  /**
   * Clear all theaters cache
   */
  clearTheatersCache() {
    this.cache.deletePattern(`${CACHE_PREFIXES.THEATERS_LIST}*`);
    return { message: "Theaters cache cleared successfully" };
  }

  /**
   * Warm up cache with frequently accessed data
   * This can be called during application startup
   */
  async warmUpCache() {
    try {
      // Import services
      const moviesService = require("../../features/movies/movies.service");
      const theatersService = require("../../features/theaters/theaters.service");

      // Pre-load some common data
      console.log("Warming up cache...");

      // Load first page of movies
      await moviesService.list({ pagination: { page: 1, limit: 10 } });

      // Load theaters
      await theatersService.list();

      console.log(MESSAGES.SUCCESS.CACHE_WARMED_UP);
      return { message: MESSAGES.SUCCESS.CACHE_WARMED_UP };
    } catch (error) {
      console.error(MESSAGES.ERRORS.CACHE_WARMUP_FAILED, error);
      return { error: MESSAGES.ERRORS.CACHE_WARMUP_FAILED, details: error.message };
    }
  }

  /**
   * Health check for cache
   */
  cacheHealthCheck() {
    const stats = this.cache.getStats();
    const isHealthy = stats.activeEntries >= 0 && stats.totalEntries <= stats.maxSize;

    return {
      healthy: isHealthy,
      stats,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = CacheManager;
