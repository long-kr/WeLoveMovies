const router = require("express").Router({ mergeParams: true });
const controller = require("./movies.controller");
const methodNotAllowed = require("../error/methodNotAllowed");
const { validateMoviesQuery } = require("../utils");

router.route("/")
  .get(validateMoviesQuery, controller.list)
  .all(methodNotAllowed);

router.route("/:movieId([0-9]+)")
  .get(controller.read)
  .all(methodNotAllowed);

router.route("/:movieId([0-9]+)/theaters")
  .get(controller.readMovieTheaters)
  .all(methodNotAllowed);

router.route("/:movieId([0-9]+)/reviews")
  .get(controller.readMovieReviews)
  .all(methodNotAllowed);

module.exports = router;