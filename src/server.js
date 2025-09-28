const config = require("./config");
const app = require("./app");
const knex = require("./db/connection");
const { cacheManager } = require("./lib/cache");

const listener = () => {
  console.log("NODE_ENV: ", process.env.NODE_ENV);
  console.log(`Listening on Port: ${config.server.port}!`);
};

knex.migrate
  .latest()
  .then((migrations) => {
    console.log("migrations", migrations);

    // Warm up cache after migrations
    cacheManager.warmUpCache();

    app.listen(config.server.port, listener);
  })
  .catch(console.error);
