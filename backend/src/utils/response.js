// Response utility helper
export const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, error, message = "Error", statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error : undefined,
  });
};

export default {
  sendSuccess,
  sendError,
};
