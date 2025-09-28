/**
 * Theaters Feature Module
 * Exports all theaters-related functionality
 */

const theatersController = require("./theaters.controller");
const theatersService = require("./theaters.service");
const theatersRouter = require("./theaters.router");

module.exports = {
  controller: theatersController,
  service: theatersService,
  router: theatersRouter,
};
