// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
};

// 404 handler
export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};
