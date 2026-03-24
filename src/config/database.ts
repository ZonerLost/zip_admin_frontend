import mongoose from "mongoose";
import { ENV } from "./env";
import { logger } from "./logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!ENV.MONGODB_URI || ENV.MONGODB_URI === "your_mongodb_atlas_uri_here") {
      logger.warn("MongoDB URI not configured. Skipping database connection.");
      return;
    }
    mongoose.set("strictQuery", true);
    await mongoose.connect(ENV.MONGODB_URI, {
      dbName: "zonerlost",
    });
    logger.info("MongoDB Atlas connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    logger.warn("Server starting without database connection...");
    // Don't exit process, let server start anyway
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});