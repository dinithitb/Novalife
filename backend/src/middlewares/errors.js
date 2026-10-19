function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

function errorHandler(err, req, res, next) {
  // Log the full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`❌ ${req.method} ${req.path} →`, err.message);
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    // Only include stack trace in development (never show in production)
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
