const service = require("./movies.service");
const { asyncErrorBoundary } = require("../../middleware");
const { NotFoundError, ValidationError } = require("../../middleware/errors/CustomError");
const { parseMoviesQueryParams } = require("../../lib/data");

/**
 * Check if movie exists
 */
async function hasMovie(req, res, next) {
  const { movieId } = req.params;

  if (!movieId) throw new ValidationError("MovieId is required");

  const movie = await service.read(movieId);

  if (!movie) throw new NotFoundError("Movie cannot be found: " + movieId);

  res.locals.movie = movie;
  return next();
}

/**
 * List all movies or movies that are showing with pagination and filtering
 */
async function list(req, res) {
  const { filters, pagination } = parseMoviesQueryParams(req.query);
  const isShowing = req.query.is_showing === "true";

  const result = await service.list({
    filters,
    pagination,
    isShowing,
  });

  res.json(result);
}

/**
 * Get movie details
 */
async function read(_, res) {
  res.json({ data: res.locals.movie });
}

/**
 * Get theaters showing the movie
 */
async function readMovieTheaters(req, res) {
  const theaters = await service.readMovieTheaters(req.params.movieId);
  res.json({ data: theaters });
}

/**
 * Get reviews for the movie
 */
async function readMovieReviews(req, res) {
  const reviews = await service.readMovieReviews(req.params.movieId);
  res.json({ data: reviews });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(hasMovie), asyncErrorBoundary(read)],
  readMovieTheaters: [asyncErrorBoundary(hasMovie), asyncErrorBoundary(readMovieTheaters)],
  readMovieReviews: [asyncErrorBoundary(hasMovie), asyncErrorBoundary(readMovieReviews)],
};
