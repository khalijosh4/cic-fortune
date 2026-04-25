const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${req.method} ${req.path}`);
  console.error(err.stack || err.message);

  // Validation errors
  if (err.type === "validation") {
    return res.status(400).json({ success: false, error: err.message, details: err.details });
  }

  // SQLite constraint errors
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ success: false, error: "A record with this identifier already exists." });
  }
  if (err.code && err.code.startsWith("SQLITE_")) {
    return res.status(500).json({ success: false, error: "Database error. Please try again." });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, error: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, error: "Token expired." });
  }

  // Generic
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error." : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
