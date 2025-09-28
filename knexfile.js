const path = require("path");
const config = require("./src/config");

// Add path resolution for database config
const databaseConfig = {};

Object.keys(config.database).forEach((env) => {
  databaseConfig[env] = {
    ...config.database[env],
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
  };
});

module.exports = databaseConfig;
