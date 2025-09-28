/**
 * TMDb Feature Module
 * Exports all TMDb-related functionality
 */

const tmdbController = require("./tmdb.controller");
const tmdbService = require("./tmdb.service");
const tmdbRouter = require("./tmdb.router");
const tmdbSyncService = require("./tmdb-sync.service");

module.exports = {
  controller: tmdbController,
  service: tmdbService,
  router: tmdbRouter,
  syncService: tmdbSyncService,
};
