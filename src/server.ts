import app from "./app";
import { connectDatabase } from "./config/database";
import { ENV } from "./config/env";
import { logger } from "./config/logger";

const startServer = async () => {
  await connectDatabase();
  app.listen(ENV.PORT, () => {
    logger.info(`🚀 Zonerlost API running on port ${ENV.PORT}`);
    logger.info(`📍 Environment: ${ENV.NODE_ENV}`);
    logger.info(
      `🔗 Health: http://localhost:${ENV.PORT}/api/${ENV.API_VERSION}/health`
    );
  });
};

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();