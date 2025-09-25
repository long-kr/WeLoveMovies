const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  handler: (_, __, next) => {
    next({
      message: "Too many requests from this IP, please try again later.",
      statusCode: 429,
    });
  },
});

module.exports = {
  limiter,
};
