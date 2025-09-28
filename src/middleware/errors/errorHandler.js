const { HTTP_STATUS, MESSAGES } = require("../../constants");

function errorHandler(error, _, res, __) {
  // Determine environment
  const isProduction = process.env.NODE_ENV === "production";

  // Handle specific error types
  if (error.name === "ValidationError") {
    // Custom validation error
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.status = "fail";
  } else if (error.name === "NotFoundError") {
    // Custom not found error
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.status = "fail";
  } else if (error.code === "23505") {
    // PostgreSQL unique violation
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.message = "Duplicate entry found";
  } else {
    // Default error status and message
    error.statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    error.status = error.status || "error";
  }

  // Prepare response based on environment
  const errorResponse = {
    status: error.status,
    message: error.message,
    ...(isProduction
      ? {}
      : {
          error: error,
          stack: error.stack,
        }),
  };

  // Handle database connection errors
  if (error.code === "ECONNREFUSED") {
    errorResponse.message = MESSAGES.ERRORS.DATABASE_ERROR;
    error.statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
  }

  // Handle validation errors from knex/postgres
  if (error.code === "23502") {
    // not null violation
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    errorResponse.message = "Missing required fields";
  }

  // Log error in development
  if (!isProduction) {
    // console.log("Error:", {
    //   message: error.message,
    //   stack: error.stack,
    //   code: error.code,
    //   name: error.name,
    //   statusCode: error.statusCode,
    //   status: error.status,
    // });
  }

  res.status(error.statusCode).json(errorResponse);
}

module.exports = errorHandler;
