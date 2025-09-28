/**
 * Application Configuration
 * Centralized configuration management with environment-based settings
 */

require("dotenv").config();

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || "5000"),
    host: process.env.HOST || "localhost",
    env: process.env.NODE_ENV || "development",
  },

  // Database Configuration
  database: {
    development: {
      client: "postgresql",
      connection: process.env.DEVELOPMENT_DATABASE_URL,
      pool: { min: 0, max: 5 },
      migrations: {
        directory: "./src/db/migrations",
      },
      seeds: {
        directory: "./src/db/seeds",
      },
    },
    production: {
      client: "postgresql",
      connection: process.env.PRODUCTION_DATABASE_URL,
      pool: { min: 0, max: 5 },
      migrations: {
        directory: "./src/db/migrations",
      },
      seeds: {
        directory: "./src/db/seeds",
      },
    },
  },

  // Cache Configuration
  cache: {
    defaultTTL: parseInt(process.env.CACHE_TTL || "300000"), // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || "20"), // 20 entries
    cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || "60000"), // 1 minute
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Security Configuration
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: process.env.CORS_CREDENTIALS === "true",
    },
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === "production",
    },
    apiKey: {
      enabled: process.env.API_KEY_ENABLED === "true",
      hash: process.env.API_KEY_HASH,
      secret: process.env.API_KEY_SECRET || "default-secret-change-in-production",
      required: process.env.API_KEY_REQUIRED !== "false", // Default to true
      skipPaths: (process.env.API_KEY_SKIP_PATHS || "").split(",").filter(Boolean),
    },
  },

  // External APIs
  apis: {
    tmdb: {
      apiKey: process.env.TMDB_API_KEY,
      baseURL: "https://api.themoviedb.org/3",
      imageBaseURL: "https://image.tmdb.org/t/p/w500",
      timeout: parseInt(process.env.TMDB_TIMEOUT || "10000"),
    },
  },

  // Application Limits
  limits: {
    requestBodySize: process.env.REQUEST_BODY_SIZE || "10kb",
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || "50"),
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || "10"),
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
  },
};

// Validation
function validateConfig() {
  const required = [];

  if (config.server.env !== "test" && !config.database[config.server.env]?.connection) {
    required.push(`${config.server.env.toUpperCase()}_DATABASE_URL`);
  }

  if (required.length > 0) {
    throw new Error(`Missing required environment variables: ${required.join(", ")}`);
  }
}

// Validate configuration on load
validateConfig();

module.exports = config;
