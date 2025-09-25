class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends CustomError {
  constructor(message, fields) {
    super(400, message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

class NotFoundError extends CustomError {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

class DatabaseError extends CustomError {
  constructor(message = "Database error occurred") {
    super(500, message);
    this.name = "DatabaseError";
  }
}

class ForbiddenError extends CustomError {
  constructor(message = "Access forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

module.exports = {
  CustomError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  ForbiddenError,
};
