import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required when USE_MOCK is false");
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      serverSelectionTimeoutMS: Number(
        process.env.MONGO_SERVER_TIMEOUT_MS || 5000
      ),
    });

    logger.info("MongoDB connected");
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  }
};
