const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error object
  const error = {
    message: err.message || "An unexpected error occurred",
    code: err.code || "INTERNAL_SERVER_ERROR",
    status: err.status || 500,
  };

  // Handle specific types of errors
  if (err.name === "ValidationError") {
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    error.details = Object.values(err.errors).map((e) => e.message);
  }

  if (err.name === "MongoError" || err.name === "MongoServerError") {
    if (err.code === 11000) {
      error.status = 409;
      error.code = "DUPLICATE_ERROR";
      error.message = "A resource with that identifier already exists";
    }
  }

  if (err.name === "JsonWebTokenError") {
    error.status = 401;
    error.code = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    error.status = 401;
    error.code = "TOKEN_EXPIRED";
  }

  // Handle multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error.status = 400;
    error.code = "FILE_TOO_LARGE";
    error.message = "File is too large. Maximum size is 5MB";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error.status = 400;
    error.code = "INVALID_FILE_FIELD";
    error.message = "Invalid file upload field";
  }

  // Handle Cloudinary errors
  if (err.http_code) {
    error.status = err.http_code;
    error.code = "CLOUDINARY_ERROR";
  }

  // Remove error stack in production
  if (process.env.NODE_ENV === "production") {
    delete error.stack;
  }

  // Send error response
  res.status(error.status).json(error);
};

module.exports = errorHandler;
