function errorHandler(error, _, res, __) {
  // Determine environment
  const isProduction = process.env.NODE_ENV === "production";

  // Handle specific error types
  if (error.name === "ValidationError") {
    // Custom validation error
    error.statusCode = 400;
    error.status = "fail";
  } else if (error.name === "NotFoundError") {
    // Custom not found error
    error.statusCode = 404;
    error.status = "fail";
  } else if (error.code === "23505") {
    // PostgreSQL unique violation
    error.statusCode = 409;
    error.message = "Duplicate entry found";
  } else {
    // Default error status and message
    error.statusCode = error.statusCode || 500;
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
    errorResponse.message = "Database connection failed";
    error.statusCode = 503;
  }

  // Handle validation errors from knex/postgres
  if (error.code === "23502") {
    // not null violation
    error.statusCode = 400;
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
