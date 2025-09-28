const { HTTP_STATUS, MESSAGES } = require("../../constants");

function methodNotAllowed(req, res, next) {
  next({
    status: HTTP_STATUS.METHOD_NOT_ALLOWED,
    statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
    message: `${req.method} ${MESSAGES.ERRORS.METHOD_NOT_ALLOWED} ${req.originalUrl}`,
  });
}

module.exports = methodNotAllowed;
