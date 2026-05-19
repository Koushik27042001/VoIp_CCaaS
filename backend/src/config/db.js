import mongoose from "mongoose";
import logger from "../telemetry/logger.js";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.fatal("MONGO_URI is required");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.fatal({ err: error }, "MongoDB connection failed");
    process.exit(1);
  }
};
