/**
 * Cache Feature Module
 * Exports all cache-related functionality
 */

const cacheController = require("./cache.controller");
const cacheRouter = require("./cache.router");

module.exports = {
  controller: cacheController,
  router: cacheRouter,
};
