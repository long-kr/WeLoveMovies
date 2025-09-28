/**
 * Cache Library
 * Centralized cache functionality with improved organization
 */

const SimpleCache = require("./SimpleCache");
const CacheManager = require("./CacheManager");
const config = require("../../config");

// Create singleton cache instance
const cache = new SimpleCache(config.cache);

// Create cache manager instance
const cacheManager = new CacheManager(cache);

module.exports = {
  cache,
  cacheManager,
  SimpleCache,
  CacheManager,
};
