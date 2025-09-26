function notFound(req, res, next) {
  return next({
    status: 404,
    statusCode: 404,
    message: `404! Route is not found: ${req.originalUrl}`,
  });
}

module.exports = notFound;
