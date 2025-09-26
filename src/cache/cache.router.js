/**
 * Cache management router
 * Provides routes for cache administration and monitoring
 */

const express = require("express");
const router = express.Router();
const cacheController = require("./cache.controller");

// Cache statistics and health
router.get("/stats", cacheController.getCacheStats);
router.get("/health", cacheController.cacheHealthCheck);

// Cache management operations
router.delete("/clear", cacheController.clearAllCache);
router.delete("/clear/pattern/:pattern", cacheController.clearCachePattern);
router.delete("/clear/movie/:movieId", cacheController.clearMovieCache);
router.delete("/clear/review/:reviewId", cacheController.clearReviewCache);

// Cache warming
router.post("/warmup", cacheController.warmUpCache);

module.exports = router;


