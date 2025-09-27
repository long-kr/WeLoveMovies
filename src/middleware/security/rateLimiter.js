const { rateLimit } = require("express-rate-limit");
const config = require("../../config");
const { HTTP_STATUS, MESSAGES } = require("../../constants");

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
  handler: (_, __, next) => {
    next({
      message: MESSAGES.ERRORS.TOO_MANY_REQUESTS,
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    });
  },
});

module.exports = {
  limiter,
};
