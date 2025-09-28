/**
 * API Key Authentication Tests
 */

const request = require("supertest");
const app = require("../src/app");
const { generateApiKeyPair } = require("../src/middleware/security/apiKeyAuth");

describe("API Key Authentication", () => {
  let validApiKey;
  let validHash;

  beforeAll(() => {
    // Generate a test API key pair
    const keyPair = generateApiKeyPair();
    validApiKey = keyPair.key;
    validHash = keyPair.hash;

    // Set up environment for testing
    process.env.API_KEY_ENABLED = "true";
    process.env.API_KEY_REQUIRED = "true";
    process.env.API_KEY_HASH = validHash;
    process.env.API_KEY_SECRET = "test-secret-key-for-api-authentication";
  });

  afterAll(() => {
    // Clean up environment
    delete process.env.API_KEY_ENABLED;
    delete process.env.API_KEY_REQUIRED;
    delete process.env.API_KEY_HASH;
    delete process.env.API_KEY_SECRET;
  });

  describe("When API key authentication is enabled", () => {
    test("should reject requests without API key", async () => {
      const response = await request(app)
        .get("/movies")
        .expect(401);

      expect(response.body).toMatchObject({
        status: "fail",
        message: expect.stringContaining("API key is required")
      });
    });

    test("should reject requests with invalid API key", async () => {
      const response = await request(app)
        .get("/movies")
        .set("x-api-key", "invalid-key")
        .expect(401);

      expect(response.body).toMatchObject({
        status: "fail",
        message: expect.stringContaining("Invalid API key")
      });
    });

    test("should accept requests with valid API key in x-api-key header", async () => {
      const response = await request(app)
        .get("/movies")
        .set("x-api-key", validApiKey);

      // Should not return 401 (may return other errors like database connection)
      expect(response.status).not.toBe(401);
    });

    test("should accept requests with valid API key in Authorization Bearer header", async () => {
      const response = await request(app)
        .get("/movies")
        .set("Authorization", `Bearer ${validApiKey}`);

      // Should not return 401 (may return other errors like database connection)
      expect(response.status).not.toBe(401);
    });

    test("should accept requests with valid API key in Authorization ApiKey header", async () => {
      const response = await request(app)
        .get("/movies")
        .set("Authorization", `ApiKey ${validApiKey}`);

      // Should not return 401 (may return other errors like database connection)
      expect(response.status).not.toBe(401);
    });
  });

  describe("When API key authentication is disabled", () => {
    beforeAll(() => {
      process.env.API_KEY_ENABLED = "false";
    });

    afterAll(() => {
      process.env.API_KEY_ENABLED = "true";
    });

    test("should accept requests without API key", async () => {
      const response = await request(app)
        .get("/movies");

      // Should not return 401 (may return other errors like database connection)
      expect(response.status).not.toBe(401);
    });
  });

  describe("When API key is optional", () => {
    beforeAll(() => {
      process.env.API_KEY_ENABLED = "true";
      process.env.API_KEY_REQUIRED = "false";
    });

    afterAll(() => {
      process.env.API_KEY_REQUIRED = "true";
    });

    test("should accept requests without API key", async () => {
      const response = await request(app)
        .get("/movies");

      // Should not return 401 (may return other errors like database connection)
      expect(response.status).not.toBe(401);
    });

    test("should still validate API key if provided", async () => {
      const response = await request(app)
        .get("/movies")
        .set("x-api-key", "invalid-key")
        .expect(401);

      expect(response.body).toMatchObject({
        status: "fail",
        message: expect.stringContaining("Invalid API key")
      });
    });
  });

  describe("Skip paths functionality", () => {
    beforeAll(() => {
      process.env.API_KEY_ENABLED = "true";
      process.env.API_KEY_REQUIRED = "true";
      process.env.API_KEY_SKIP_PATHS = "/health,/status";
    });

    afterAll(() => {
      delete process.env.API_KEY_SKIP_PATHS;
    });

    test("should skip authentication for configured paths", async () => {
      // Note: These endpoints may not exist, but they shouldn't return 401
      const healthResponse = await request(app).get("/health");
      const statusResponse = await request(app).get("/status");

      expect(healthResponse.status).not.toBe(401);
      expect(statusResponse.status).not.toBe(401);
    });

    test("should still require authentication for other paths", async () => {
      const response = await request(app)
        .get("/movies")
        .expect(401);

      expect(response.body).toMatchObject({
        status: "fail",
        message: expect.stringContaining("API key is required")
      });
    });
  });
});
