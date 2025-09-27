const { HTTP_STATUS, MESSAGES } = require("../../constants");

function notFound(req, res, next) {
  return next({
    status: HTTP_STATUS.NOT_FOUND,
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `${MESSAGES.ERRORS.ROUTE_NOT_FOUND}: ${req.originalUrl}`,
  });
}

module.exports = notFound;
