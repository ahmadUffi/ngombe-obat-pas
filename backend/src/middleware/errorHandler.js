// Error handler middleware yang sederhana dan konsisten
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error response
  let error = {
    success: false,
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    error.status = 400;
    error.message = "Data yang dikirim tidak valid";
  } else if (err.name === "UnauthorizedError" || err.status === 401) {
    error.status = 401;
    error.message = "Tidak memiliki akses";
  } else if (err.name === "NotFoundError" || err.status === 404) {
    error.status = 404;
    error.message = "Data tidak ditemukan";
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Catch 404 routes
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan`,
  });
};

// Async error wrapper - untuk menghindari try-catch berulang
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
