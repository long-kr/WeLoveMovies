require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet").default;

const notFound = require("./error/notFound");
const errorHandler = require("./error/errorHandler");
const theatersRouter = require("./theaters/theaters.router");
const moviesRouter = require("./movies/movies.router");
const reviewsRouter = require("./reviews/reviews.router");
const cacheRouter = require("./cache/cache.router");
const { limiter } = require("./utils/ratelimiter");

const app = express();

app.use(limiter);
app.use(helmet());

app.options("*", cors());
app.use(cors());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/movies", moviesRouter);
app.use("/theaters", theatersRouter);
app.use("/reviews", reviewsRouter);
app.use("/cache", cacheRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
