if (process.env.USER) require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet").default;

const notFound = require('./error/notFound');
const errorHandler = require("./error/errorHandler");
const theatersRouter = require('./theaters/theaters.router');
const moviesRouter = require('./movies/movies.router');
const reviewsRouter = require('./reviews/reviews.router');


const app = express();

// Define rate limit configurations
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Add Helmet middleware for security headers
app.use(helmet());

app.options("*", cors());
app.use(cors());

// Add request size limits
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit URL-encoded payload size

app.use("/movies", moviesRouter);
app.use("/theaters", theatersRouter);
app.use("/reviews", reviewsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
