// Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404); // Ensure status is set before passing the error
  next(error);
};

// Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack:
      process.env.NODE_ENV === "production"
        ? "No stack trace available"
        : err.stack,
  });

  // Log the error (you could add more sophisticated logging here)
  console.error(`[ERROR] ${err.message}\nStack: ${err.stack}`);
};

export { errorHandler, notFound };

