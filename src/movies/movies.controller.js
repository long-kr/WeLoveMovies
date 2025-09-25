const service = require("./movies.service");
const asyncErrorBoundary = require("../error/asyncErrorBoundary");
const { NotFoundError, ValidationError, DatabaseError } = require("../error/CustomError");
const { handleDatabaseError, parseMoviesQueryParams } = require("../utils");

/**
 * Check if movie exists
 */
async function hasMovie(req, res, next) {
  const { movieId } = req.params;
    
  if (!movieId) {
    throw new ValidationError("MovieId is required");
  }

  try {
    const movie = await service.read(movieId);
    if (!movie) {
      throw new NotFoundError("Movie cannot be found");
    }
    res.locals.movie = movie;
    return next();
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError("Error checking movie existence");
  }
}


/**
 * List all movies or movies that are showing with pagination and filtering
 */
async function list(req, res) {
  const { filters, pagination } = parseMoviesQueryParams(req.query);
  const isShowing = req.query.is_showing === "true";

  try {
    const result = await service.list({
      filters,
      pagination,
      isShowing
    });
    
    res.json(result);
  } catch (error) {
    throw handleDatabaseError(error, "Error retrieving movies list");
  }
}


/**
 * Get movie details
 */
async function read(req, res) {
  res.json({ data: res.locals.movie });
}

/**
 * Get theaters showing the movie
 */
async function readMovieTheaters(req, res) {
  try {
    const theaters = await service.readMovieTheaters(req.params.movieId);
    res.json({ data: theaters });
  } catch (error) {
    throw handleDatabaseError(error, "Error retrieving movie theaters");
  }
}

/**
 * Get reviews for the movie
 */
async function readMovieReviews(req, res) {
  try {
    const reviews = await service.readMovieReviews(req.params.movieId);
    res.json({ data: reviews });
  } catch (error) {
    throw handleDatabaseError(error, "Error retrieving movie reviews");
  }
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [
    asyncErrorBoundary(hasMovie),
    asyncErrorBoundary(read)
  ],
  readMovieTheaters: [
    asyncErrorBoundary(hasMovie),
    asyncErrorBoundary(readMovieTheaters)
  ],
  readMovieReviews: [
    asyncErrorBoundary(hasMovie),
    asyncErrorBoundary(readMovieReviews)
  ]
};