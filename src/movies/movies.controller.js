const service = require('./movies.service');
const asyncErrorBoundary = require('../error/asyncErrorBoundary');

async function list (req, res, next) {
    const isShowing = await req.query.is_showing;

    if(isShowing == "true") {
        return res.json({ data: await service.listShowing() });
    }

    res.json({ data : await service.list()});
};

async function hasMovie(req, res, next) {
    const { movieId } = req.params;
    const movie = await service.read(movieId);

    if(movie) {
        return next();
    };

    next({
        status: 404,
        message: "Movie cannot be found"
    });
};

async function read(req, res) {
    res.json({ data: await service.read(req.params.movieId) });
};

async function readMovieTheaters(req, res) {
    res.json({ data: await service.readMovieTheaters(req.params.movieId)});
};

async function readMovieReviews(req, res) {
    res.json({ data: await service.readMovieReviews(req.params.movieId)});
};

module.exports = {
    list: asyncErrorBoundary(list),
    read: [asyncErrorBoundary(hasMovie), asyncErrorBoundary(read)],
    readMovieTheaters: [ asyncErrorBoundary(hasMovie), asyncErrorBoundary(readMovieTheaters)],
    readMovieReviews: [ asyncErrorBoundary(hasMovie), asyncErrorBoundary(readMovieReviews)],

}