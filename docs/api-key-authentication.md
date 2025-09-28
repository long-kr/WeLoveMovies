# API Key Authentication

This document describes the API key authentication system implemented in the We Love Movies API.

## Overview

The API key authentication system provides a simple and secure way to protect your API endpoints using hash-based validation. Client requests must include a valid API key that is verified against a stored hash using HMAC-SHA256.

## Features

- **Hash-based validation**: API keys are validated using HMAC-SHA256 hashes stored in environment variables
- **Multiple header formats**: Supports `x-api-key`, `Authorization: Bearer`, and `Authorization: ApiKey` headers
- **Configurable security**: Enable/disable authentication, make it optional, and configure skip paths
- **Timing attack protection**: Uses `crypto.timingSafeEqual` to prevent timing attacks
- **Easy key generation**: Includes utility scripts for generating API keys and hashes

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# API Key Authentication
API_KEY_ENABLED=true                    # Enable/disable API key authentication
API_KEY_REQUIRED=true                   # Whether API key is required (default: true)
API_KEY_HASH=your-generated-hash-here   # The hash of your API key
API_KEY_SECRET=your-secret-for-hashing  # Secret used for hashing (min 32 chars)
API_KEY_SKIP_PATHS=/health,/status      # Comma-separated paths to skip authentication
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_KEY_ENABLED` | Enable API key authentication | `false` | No |
| `API_KEY_REQUIRED` | Require API key for all requests | `true` | No |
| `API_KEY_HASH` | Hash of the valid API key | - | Yes (if enabled) |
| `API_KEY_SECRET` | Secret for hashing operations | `default-secret-change-in-production` | Yes |
| `API_KEY_SKIP_PATHS` | Paths to skip authentication | - | No |

## Generating API Keys

### Using the Utility Script

The project includes a utility script to generate API keys and their hashes:

```bash
# Generate a new API key and hash
node src/scripts/generateApiKey.js

# Generate a 64-character API key
node src/scripts/generateApiKey.js --length 64

# Generate hash for an existing key
node src/scripts/generateApiKey.js --key "your-existing-key"

# Show help
node src/scripts/generateApiKey.js --help
```

### Manual Generation

You can also generate keys programmatically:

```javascript
const { generateApiKeyPair } = require('./src/middleware/security/apiKeyAuth');

// Generate a new key pair
const { key, hash } = generateApiKeyPair(32);
console.log('API Key:', key);
console.log('Hash:', hash);
```

## Client Usage

### Supported Header Formats

Clients can provide API keys using any of these header formats:

#### 1. x-api-key Header (Recommended)
```bash
curl -H "x-api-key: your-api-key-here" http://localhost:5000/movies
```

#### 2. Authorization Bearer Token
```bash
curl -H "Authorization: Bearer your-api-key-here" http://localhost:5000/movies
```

#### 3. Authorization ApiKey
```bash
curl -H "Authorization: ApiKey your-api-key-here" http://localhost:5000/movies
```

### JavaScript Examples

#### Using fetch
```javascript
// Using x-api-key header
fetch('http://localhost:5000/movies', {
  headers: {
    'x-api-key': 'your-api-key-here'
  }
});

// Using Authorization header
fetch('http://localhost:5000/movies', {
  headers: {
    'Authorization': 'Bearer your-api-key-here'
  }
});
```

#### Using axios
```javascript
// Using x-api-key header
axios.get('http://localhost:5000/movies', {
  headers: {
    'x-api-key': 'your-api-key-here'
  }
});

// Using Authorization header
axios.get('http://localhost:5000/movies', {
  headers: {
    'Authorization': 'Bearer your-api-key-here'
  }
});
```

## Error Responses

### Missing API Key
```json
{
  "status": "fail",
  "message": "API key is required. Please provide a valid API key in the x-api-key header or Authorization header"
}
```
**HTTP Status:** 401 Unauthorized

### Invalid API Key
```json
{
  "status": "fail",
  "message": "Invalid API key provided. Please check your API key and try again"
}
```
**HTTP Status:** 401 Unauthorized

## Security Considerations

### Best Practices

1. **Keep API keys secret**: Never commit API keys to version control
2. **Use environment variables**: Store only the hash in environment variables, not the key
3. **Rotate keys regularly**: Generate new API keys periodically
4. **Use HTTPS**: Always use HTTPS in production to protect keys in transit
5. **Monitor usage**: Log API key usage for security monitoring

### Hash Security

- Uses HMAC-SHA256 for hashing
- Includes timing attack protection with `crypto.timingSafeEqual`
- Requires a secret key for hash generation
- Hash verification is constant-time to prevent timing attacks

### Key Generation

- Uses `crypto.randomBytes` for secure random key generation
- Default key length is 32 bytes (64 hex characters)
- Minimum recommended length is 16 bytes (32 hex characters)

## Development Setup

### 1. Generate API Key
```bash
node src/scripts/generateApiKey.js
```

### 2. Update Environment
Add the generated hash to your `.env` file:
```env
API_KEY_ENABLED=true
API_KEY_HASH=generated-hash-from-step-1
API_KEY_SECRET=your-secret-key-min-32-chars
```

### 3. Test Authentication
```bash
# This should fail (no API key)
curl http://localhost:5000/movies

# This should succeed
curl -H "x-api-key: your-generated-key" http://localhost:5000/movies
```

## Production Deployment

### 1. Environment Configuration
Ensure these environment variables are set in production:
```env
API_KEY_ENABLED=true
API_KEY_REQUIRED=true
API_KEY_HASH=your-production-hash
API_KEY_SECRET=your-production-secret-min-32-chars
```

### 2. Key Distribution
- Share API keys securely with authorized clients
- Use secure channels (encrypted email, secure file sharing)
- Document which keys are issued to which clients

### 3. Monitoring
- Log authentication attempts
- Monitor for invalid key usage
- Set up alerts for suspicious activity

## Troubleshooting

### Common Issues

#### "API key secret not configured"
- Ensure `API_KEY_SECRET` is set in your environment
- Secret should be at least 32 characters long

#### "Invalid API key provided"
- Verify the API key matches the one used to generate the hash
- Check that the same secret was used for hash generation and validation
- Ensure the hash in `API_KEY_HASH` is correct

#### Authentication not working
- Verify `API_KEY_ENABLED=true` in your environment
- Check that the middleware is properly integrated in `app.js`
- Ensure the client is sending the API key in a supported header format

### Debug Mode

To debug authentication issues, you can temporarily add logging to the middleware:

```javascript
// In src/middleware/security/apiKeyAuth.js
console.log('API Key provided:', providedKey);
console.log('Stored hash:', storedHash);
console.log('Generated hash:', generateApiKeyHash(providedKey));
```

**Note:** Remove debug logging in production to avoid exposing sensitive information.

## API Reference

### Middleware Functions

#### `createApiKeyMiddleware(options)`
Creates the API key authentication middleware.

**Parameters:**
- `options.required` (boolean): Whether API key is required (default: true)
- `options.skipPaths` (Array<string>): Paths to skip authentication

**Returns:** Express middleware function

#### `generateApiKey(length)`
Generates a new random API key.

**Parameters:**
- `length` (number): Length of the key in bytes (default: 32)

**Returns:** String - The generated API key

#### `generateApiKeyHash(apiKey)`
Generates a hash for an API key.

**Parameters:**
- `apiKey` (string): The API key to hash

**Returns:** String - The generated hash

#### `generateApiKeyPair(length)`
Generates a new API key and its hash.

**Parameters:**
- `length` (number): Length of the key in bytes (default: 32)

**Returns:** Object - `{ key: string, hash: string }`

#### `validateApiKey(providedKey, storedHash)`
Validates an API key against a stored hash.

**Parameters:**
- `providedKey` (string): The API key to validate
- `storedHash` (string): The stored hash to validate against

**Returns:** Boolean - True if the key is valid
