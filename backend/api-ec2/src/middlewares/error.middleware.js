function notFound(req, res) {
  res.status(404).json({
    ok: false,
    error: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.code || "INTERNAL_ERROR",
    message: err.message || "Unexpected error"
  });
}

module.exports = { notFound, errorHandler };
