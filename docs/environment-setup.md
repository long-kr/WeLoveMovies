# Environment Setup Guide

This guide explains how to set up your environment variables for the We Love Movies API, including the new API key authentication feature.

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# We Love Movies API - Environment Configuration

# Server Configuration
PORT=5000
HOST=localhost
NODE_ENV=development

# Database Configuration
DEVELOPMENT_DATABASE_URL=postgresql://username:password@localhost:5432/welovemovies_dev
PRODUCTION_DATABASE_URL=postgresql://username:password@localhost:5432/welovemovies_prod

# API Key Authentication
# Generate keys using: node src/scripts/generateApiKey.js
API_KEY_ENABLED=true
API_KEY_REQUIRED=true
API_KEY_HASH=your-generated-hash-here
API_KEY_SECRET=your-secret-key-for-hashing-min-32-chars
API_KEY_SKIP_PATHS=/health,/status

# External APIs
TMDB_API_KEY=your-tmdb-api-key

# Cache Configuration
CACHE_TTL=300000
CACHE_MAX_SIZE=20
CACHE_CLEANUP_INTERVAL=60000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=*
CORS_CREDENTIALS=false

# Application Limits
REQUEST_BODY_SIZE=10kb
MAX_PAGE_SIZE=50
DEFAULT_PAGE_SIZE=10

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

## Quick Setup for API Key Authentication

1. **Generate an API key and hash:**
   ```bash
   node src/scripts/generateApiKey.js
   ```

2. **Copy the generated hash to your .env file:**
   ```env
   API_KEY_ENABLED=true
   API_KEY_HASH=the-generated-hash-from-step-1
   API_KEY_SECRET=your-secret-key-min-32-characters
   ```

3. **Test the API with your generated key:**
   ```bash
   # This should fail (no API key)
   curl http://localhost:5000/movies
   
   # This should succeed
   curl -H "x-api-key: your-generated-api-key" http://localhost:5000/movies
   ```

## API Key Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_KEY_ENABLED` | Enable API key authentication | `false` | No |
| `API_KEY_REQUIRED` | Require API key for all requests | `true` | No |
| `API_KEY_HASH` | Hash of the valid API key | - | Yes (if enabled) |
| `API_KEY_SECRET` | Secret for hashing operations | `default-secret-change-in-production` | Yes |
| `API_KEY_SKIP_PATHS` | Comma-separated paths to skip authentication | - | No |

## Security Notes

- **Never commit your actual API keys to version control**
- **Store only the hash in environment variables, not the key itself**
- **Use a strong secret (minimum 32 characters) for `API_KEY_SECRET`**
- **Rotate API keys regularly in production**
- **Always use HTTPS in production**
