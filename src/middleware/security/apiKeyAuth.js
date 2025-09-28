const crypto = require("crypto");
const config = require("../../config");
const { HTTP_STATUS, MESSAGES } = require("../../constants");

/**
 * API Key Authentication Middleware
 * Validates API keys using hash comparison with environment variable
 */

/**
 * Generate a hash for an API key
 * @param {string} apiKey - The API key to hash
 * @returns {string} - The hashed API key
 */
function generateApiKeyHash(apiKey) {
  if (!apiKey) {
    throw new Error("API key is required for hashing");
  }

  const secret = config.security.apiKey.secret;
  const algorithm = config.security.apiKey.algorithm;

  if (!secret) {
    throw new Error("API key secret not configured");
  }

  return crypto.createHmac(algorithm, secret).update(apiKey).digest("hex");
}

/**
 * Validate an API key against the stored hash
 * @param {string} providedKey - The API key provided by the client
 * @param {string} storedHash - The stored hash to validate against
 * @returns {boolean} - True if the key is valid
 */
function validateApiKey(providedKey, storedHash) {
  if (!providedKey || !storedHash) {
    return false;
  }

  try {
    const providedHash = generateApiKeyHash(providedKey);

    // Use crypto.timingSafeEqual to prevent timing attacks
    // eslint-disable-next-line no-undef
    const providedBuffer = Buffer.from(providedHash, "hex");
    // eslint-disable-next-line no-undef
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (providedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(providedBuffer, storedBuffer);
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV !== "production") {
      console.error("API key validation error:", error);
    }
    return false;
  }
}

/**
 * Extract API key from request headers
 * Supports multiple header formats:
 * - x-api-key: {key}
 * - authorization: Bearer {key}
 * - authorization: ApiKey {key}
 */
function extractApiKey(req) {
  // Check x-api-key header first
  if (req.headers["x-api-key"]) {
    return req.headers["x-api-key"];
  }

  // Check authorization header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Support Bearer token format
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Support ApiKey format
    if (authHeader.startsWith("ApiKey ")) {
      return authHeader.substring(7);
    }

    // Support direct key in authorization header
    return authHeader;
  }

  return null;
}

/**
 * API Key Authentication Middleware
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether API key is required (default: true)
 * @param {Array<string>} options.skipPaths - Paths to skip authentication
 */
function createApiKeyMiddleware(options = { required: true, skipPaths: [] }) {
  const { required = true, skipPaths = [] } = options;

  return (req, res, next) => {
    // Skip authentication for specified paths
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Skip if API key authentication is disabled
    if (!config.security.apiKey.enabled) {
      return next();
    }

    const providedKey = extractApiKey(req);

    // If no key provided and not required, continue
    if (!providedKey && !required) {
      return next();
    }

    // If no key provided and required, return error
    if (!providedKey && required) {
      return next({
        message: MESSAGES.ERRORS.API_KEY_MISSING,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    // Validate the provided key
    const storedHash = config.security.apiKey.hash;

    if (!storedHash) {
      // Log error in development only
      if (process.env.NODE_ENV !== "production") {
        console.error("API key hash not configured");
      }
      return next({
        message: MESSAGES.ERRORS.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }

    const isValid = validateApiKey(providedKey, storedHash);

    if (!isValid) {
      return next({
        message: MESSAGES.ERRORS.API_KEY_INVALID,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    // Add API key info to request for potential logging
    req.apiKey = {
      validated: true,
      timestamp: new Date().toISOString(),
    };

    next();
  };
}

/**
 * Utility function to generate API key and its hash
 * @param {number} length - Length of the API key (default: 32)
 * @returns {Object} - Object containing key and hash
 */
function generateApiKeyPair(length = 32) {
  const apiKey = crypto.randomBytes(length).toString("hex");

  const hash = generateApiKeyHash(apiKey);

  return {
    key: apiKey,
    hash: hash,
  };
}

module.exports = {
  createApiKeyMiddleware,
  generateApiKeyHash,
  generateApiKeyPair,
  validateApiKey,
  extractApiKey,
};
