const router = require("express").Router();
const controller = require("./tmdb.controller");
const { methodNotAllowed } = require("../../middleware");

// Health check endpoint
router.route("/health").get(controller.healthCheck).all(methodNotAllowed);

// Sync statistics endpoint
router.route("/stats").get(controller.getSyncStats).all(methodNotAllowed);

// Sync movies from TMDb lists
router.route("/sync").post(controller.syncMovies).all(methodNotAllowed);

// Sync specific movie by TMDb ID
router.route("/sync/:tmdbId").post(controller.syncMovieById).all(methodNotAllowed);

// Search and sync movies
router.route("/search-sync").post(controller.searchAndSyncMovies).all(methodNotAllowed);

module.exports = router;
