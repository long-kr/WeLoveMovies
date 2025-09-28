/**
 * Reviews Feature Module
 * Exports all reviews-related functionality
 */

const reviewsController = require("./reviews.controller");
const reviewsService = require("./reviews.service");
const reviewsRouter = require("./reviews.router");

module.exports = {
  controller: reviewsController,
  service: reviewsService,
  router: reviewsRouter,
};
