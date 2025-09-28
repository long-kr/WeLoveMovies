#!/usr/bin/env node

/**
 * API Key Generation Utility
 * 
 * This script helps generate API keys and their corresponding hashes
 * for use with the API key authentication system.
 * 
 * Usage:
 *   node src/scripts/generateApiKey.js
 *   node src/scripts/generateApiKey.js --key "your-custom-key"
 *   node src/scripts/generateApiKey.js --length 64
 */

require("dotenv").config();
const { generateApiKey, generateApiKeyHash, generateApiKeyPair } = require("../middleware/security/apiKeyAuth");

function printUsage() {
  console.log(`
API Key Generation Utility

Usage:
  node src/scripts/generateApiKey.js [options]

Options:
  --key <key>      Generate hash for a specific key
  --length <num>   Generate a new key with specified length (default: 32)
  --help          Show this help message

Examples:
  # Generate a new API key and hash pair
  node src/scripts/generateApiKey.js

  # Generate a 64-character API key
  node src/scripts/generateApiKey.js --length 64

  # Generate hash for an existing key
  node src/scripts/generateApiKey.js --key "my-existing-api-key"

Environment Variables Required:
  API_KEY_SECRET   Secret used for hashing (set in .env file)
`);
}

function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let customKey = null;
  let keyLength = 32;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--help":
      case "-h":
        printUsage();
        return;
      case "--key":
        customKey = args[i + 1];
        i++; // Skip next argument
        break;
      case "--length":
        keyLength = parseInt(args[i + 1]);
        if (isNaN(keyLength) || keyLength < 8) {
          console.error("Error: Length must be a number >= 8");
          return;
        }
        i++; // Skip next argument
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        printUsage();
        return;
    }
  }
  
  try {
    if (customKey) {
      // Generate hash for existing key
      console.log("Generating hash for provided API key...\n");
      const hash = generateApiKeyHash(customKey);
      
      console.log("API Key Configuration:");
      console.log("=====================");
      console.log(`API Key: ${customKey}`);
      console.log(`Hash:    ${hash}`);
      console.log("");
      console.log("Environment Variables:");
      console.log("=====================");
      console.log(`API_KEY_HASH=${hash}`);
      console.log("API_KEY_ENABLED=true");
      console.log("API_KEY_REQUIRED=true");
      console.log("");
      console.log("⚠️  SECURITY WARNING:");
      console.log("   - Store the API key securely and share it only with authorized clients");
      console.log("   - Store the hash in your environment variables, not the key itself");
      console.log("   - Never commit the actual API key to version control");
      
    } else {
      // Generate new key pair
      console.log(`Generating new API key (${keyLength} characters)...\n`);
      const { key, hash } = generateApiKeyPair(keyLength);
      
      console.log("API Key Configuration:");
      console.log("=====================");
      console.log(`API Key: ${key}`);
      console.log(`Hash:    ${hash}`);
      console.log("");
      console.log("Environment Variables:");
      console.log("=====================");
      console.log(`API_KEY_HASH=${hash}`);
      console.log("API_KEY_ENABLED=true");
      console.log("API_KEY_REQUIRED=true");
      console.log("");
      console.log("Client Usage Examples:");
      console.log("=====================");
      console.log("curl -H \"x-api-key: " + key + "\" http://localhost:5000/movies");
      console.log("curl -H \"Authorization: Bearer " + key + "\" http://localhost:5000/movies");
      console.log("curl -H \"Authorization: ApiKey " + key + "\" http://localhost:5000/movies");
      console.log("");
      console.log("⚠️  SECURITY WARNING:");
      console.log("   - Store this API key securely and share it only with authorized clients");
      console.log("   - Add the hash to your .env file, not the key itself");
      console.log("   - Never commit the actual API key to version control");
    }
    
  } catch (error) {
    console.error("Error generating API key:", error.message);
    
    if (error.message.includes("API key secret not configured")) {
      console.log("\nTo fix this error:");
      console.log("1. Add API_KEY_SECRET to your .env file");
      console.log("2. Example: API_KEY_SECRET=your-secret-key-for-hashing");
      console.log("3. Make sure the secret is at least 32 characters long");
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
