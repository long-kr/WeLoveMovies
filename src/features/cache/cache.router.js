/**
 * Cache management router
 * Provides routes for cache administration and monitoring
 */

const express = require("express");
const router = express.Router();
const cacheController = require("./cache.controller");
const { methodNotAllowed } = require("../../middleware");

// Cache statistics and health
router.route("/stats").get(cacheController.getCacheStats).all(methodNotAllowed);
router.route("/health").get(cacheController.cacheHealthCheck).all(methodNotAllowed);
router.route("/keys").get(cacheController.getCacheKeys).all(methodNotAllowed);

// Cache management operations
router.route("/clear").delete(cacheController.clearAllCache).all(methodNotAllowed);

router
  .route("/clear/pattern/:pattern")
  .delete(cacheController.clearCachePattern)
  .all(methodNotAllowed);

router.route("/clear/movie/:movieId").delete(cacheController.clearMovieCache).all(methodNotAllowed);

router
  .route("/clear/review/:reviewId")
  .delete(cacheController.clearReviewCache)
  .all(methodNotAllowed);

// Cache warming
router.route("/warmup").post(cacheController.warmUpCache).all(methodNotAllowed);

module.exports = router;
