const router = require("express").Router({ mergeParams: true });
const controller = require("./movies.controller");
const methodNotAllowed = require("../error/methodNotAllowed");

router.route("/")
    .get(controller.list)
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