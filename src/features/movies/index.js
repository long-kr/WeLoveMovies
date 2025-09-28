/**
 * Movies Feature Module
 * Exports all movies-related functionality
 */

const moviesController = require("./movies.controller");
const moviesService = require("./movies.service");
const moviesRouter = require("./movies.router");

module.exports = {
  controller: moviesController,
  service: moviesService,
  router: moviesRouter,
};
