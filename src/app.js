require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet").default;

const config = require("./config");
const { notFound, errorHandler, rateLimiter, apiKeyAuth } = require("./middleware");

// Feature routers
const { router: theatersRouter } = require("./features/theaters");
const { router: moviesRouter } = require("./features/movies");
const { router: reviewsRouter } = require("./features/reviews");
const { router: cacheRouter } = require("./features/cache");
const { router: tmdbRouter } = require("./features/tmdb");

const createApiKeyMiddleware = apiKeyAuth.createApiKeyMiddleware({
  required: config.security.apiKey.required,
  skipPaths: config.security.apiKey.skipPaths,
});

const app = express();

app.use(rateLimiter.limiter);
app.use(helmet(config.security.helmet));

app.options("*", cors(config.security.cors));
app.use(cors(config.security.cors));

app.use(express.json({ limit: config.limits.requestBodySize }));
app.use(express.urlencoded({ extended: true, limit: config.limits.requestBodySize }));

app.use(createApiKeyMiddleware);

app.use("/movies", moviesRouter);
app.use("/theaters", theatersRouter);
app.use("/reviews", reviewsRouter);
app.use("/cache", cacheRouter);
app.use("/tmdb", tmdbRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
