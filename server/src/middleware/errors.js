export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Request body must contain valid JSON." });
  }
  if (error.code === 11000) return res.status(409).json({ message: "That record already exists." });
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Please check the submitted information." });
  }
  console.error(error);
  res.status(error.status || 500).json({
    message: error.status ? error.message : "The server could not complete this request."
  });
}
