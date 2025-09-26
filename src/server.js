const { PORT = 5000 } = process.env;

const app = require("./app");
const knex = require("./db/connection");
const cacheManager = require("./utils/cacheManager");

const listener = () => console.log(`Listening on Port ${PORT}!`);

knex.migrate
  .latest()
  .then((migrations) => {
    console.log("migrations", migrations);

    // Warm up cache after migrations
    cacheManager
      .warmUpCache()
      .then(() => {
        console.log("Cache warmed up successfully");
      })
      .catch((error) => {
        console.warn("Cache warmup failed:", error.message);
      });

    app.listen(PORT, listener);
  })
  .catch(console.error);
