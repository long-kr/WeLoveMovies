/**
 * Cache functionality tests
 */

const { cache, cacheManager } = require("../src/lib/cache");

describe("Cache Tests", () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  afterAll(() => {
    // Stop cleanup timer to allow Jest to exit cleanly
    cache.stopCleanup();
  });

  describe("Basic Cache Operations", () => {
    test("should set and get values", () => {
      const key = "test:key";
      const value = { data: "test data" };

      cache.set(key, value);
      const result = cache.get(key);

      expect(result).toEqual(value);
    });

    test("should return null for non-existent keys", () => {
      const result = cache.get("non:existent");
      expect(result).toBeNull();
    });

    test("should delete keys", () => {
      const key = "test:delete";
      const value = { data: "to be deleted" };

      cache.set(key, value);
      expect(cache.get(key)).toEqual(value);

      cache.delete(key);
      expect(cache.get(key)).toBeNull();
    });

    test("should generate consistent keys", () => {
      const params = { movieId: 1, page: 2, limit: 10 };
      const key1 = cache.generateKey("movies:list", params);
      const key2 = cache.generateKey("movies:list", params);

      expect(key1).toBe(key2);
    });
  });

  describe("Cache TTL", () => {
    test("should expire entries after TTL", (done) => {
      const key = "test:ttl";
      const value = { data: "expires soon" };

      // Set with very short TTL
      cache.set(key, value, 100);

      expect(cache.get(key)).toEqual(value);

      // Wait for expiration
      setTimeout(() => {
        expect(cache.get(key)).toBeNull();
        done();
      }, 150);
    });
  });

  describe("Cache Statistics", () => {
    test("should provide cache statistics", () => {
      cache.set("test:1", { data: "test1" });
      cache.set("test:2", { data: "test2" });

      const stats = cache.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.activeEntries).toBe(2);
      expect(stats.expiredEntries).toBe(0);
    });
  });

  describe("Cache Manager", () => {
    test("should clear all cache", () => {
      cache.set("test:1", { data: "test1" });
      cache.set("test:2", { data: "test2" });

      expect(cache.getStats().totalEntries).toBe(2);

      const result = cacheManager.clearAllCache();

      expect(result.message).toContain("cleared successfully");
      expect(cache.getStats().totalEntries).toBe(0);
    });

    test("should clear cache by pattern", () => {
      cache.set("movies:list:page1", { data: "movies1" });
      cache.set("movies:list:page2", { data: "movies2" });
      cache.set("theaters:list", { data: "theaters" });

      expect(cache.getStats().totalEntries).toBe(3);

      cacheManager.clearCachePattern("movies:list:*");

      expect(cache.getStats().totalEntries).toBe(1);
      expect(cache.get("theaters:list")).toBeDefined();
    });

    test("should provide health check", () => {
      const health = cacheManager.cacheHealthCheck();

      expect(health).toHaveProperty("healthy");
      expect(health).toHaveProperty("stats");
      expect(health).toHaveProperty("timestamp");
    });
  });
});
