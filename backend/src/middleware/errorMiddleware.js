/**
 * Centralized error-handling middleware.
 *
 * Express recognizes a middleware with 4 parameters as an error handler.
 * All unhandled errors in route handlers bubble up here so we can
 * send consistent JSON responses without exposing internals.
 */
const errorMiddleware = (err, req, res, _next) => {
  // Default to 500 if no status was set
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation error (e.g. schema-level validation)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.length === 1 ? messages[0] : 'Validation failed';
    return res.status(statusCode).json({
      success: false,
      message,
      errors: messages,
    });
  }

  // Mongoose CastError (bad ObjectId format that slips past middleware)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: "${err.value}"`;
  }

  // Mongoose duplicate key error (unlikely here, but defensive)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // JSON parse errors from malformed request bodies
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

export default errorMiddleware;
