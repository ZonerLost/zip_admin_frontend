import http from "http";
import app from "./app";
import { connectDatabase } from "./config/database";
import { ENV } from "./config/env";
import { logger } from "./config/logger";
import { initSocket, setIO } from "./socket";

const startServer = async () => {
  await connectDatabase();

  const httpServer = http.createServer(app);
  const io = initSocket(httpServer);
  setIO(io);

  httpServer.listen(ENV.PORT, () => {
    logger.info(`🚀 Zonerlost API running on port ${ENV.PORT}`);
    logger.info(`📍 Environment: ${ENV.NODE_ENV}`);
    logger.info(`🔗 Health: http://localhost:${ENV.PORT}/api/${ENV.API_VERSION}/health`);
    logger.info(`🔌 Socket.io ready`);
  });
};

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandledrejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();