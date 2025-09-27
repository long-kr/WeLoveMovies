/**
 * Simple in-memory cache with TTL (Time To Live) support
 * This cache stores data in memory and automatically expires entries after a specified time
 */

class SimpleCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes default
    this.maxSize = options.maxSize || 1000; // Maximum number of entries
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute cleanup interval

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Generate a cache key from parameters
   * @param {string} prefix - Cache key prefix
   * @param {Object} params - Parameters to include in key
   * @returns {string} - Generated cache key
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => `${key}:${params[key]}`)
      .join("|");

    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  }

  /**
   * Get cache keys
   * @returns {string[]} - Cache keys
   */
  getKeys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} - Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl) {
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  /**
   * Delete specific key from cache
   * @param {string} key - Cache key to delete
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (supports wildcard *)
   */
  deletePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));

    for (const cacheKey of this.cache.keys()) {
      if (regex.test(cacheKey)) {
        this.cache.delete(cacheKey);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) expiredCount++;

      totalSize += JSON.stringify(entry.value).length;
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      activeEntries: this.cache.size - expiredCount,
      totalSize: totalSize,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL,
    };
  }

  /**
   * Start automatic cleanup of expired entries
   */
  startCleanup() {
    this.cleanupTimer = global.setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);

    // Make timer non-blocking so it doesn't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      global.clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Remove expired entries from cache
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [cacheKey, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(cacheKey);
      }
    }

    keysToDelete.forEach((keyToDelete) => this.cache.delete(keyToDelete));
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists and is not expired
   */
  has(key) {
    const entry = this.cache.get(key);
    return entry && Date.now() <= entry.expiresAt;
  }
}

module.exports = SimpleCache;
