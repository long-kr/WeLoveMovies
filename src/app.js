if (process.env.USER) require("dotenv").config();
const express = require("express");
const cors = require("cors");

const notFound = require('./error/notFound');
const errorHandler = require("./error/errorHandler");
const theatersRouter = require('./theaters/theaters.router');
const moviesRouter = require('./movies/movies.router');
const reviewsRouter = require('./reviews/reviews.router');


const app = express();

app.options("*", cors());
app.use(cors());
app.use(express.json());

app.use("/movies", moviesRouter);
app.use("/theaters", theatersRouter);
app.use("/reviews", reviewsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
