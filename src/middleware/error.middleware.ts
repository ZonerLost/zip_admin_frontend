import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { sendError } from "../helpers/response.helper";
import { HTTP_STATUS } from "../config/constants";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }
  if (err.name === "ValidationError") {
    sendError(res, err.message, HTTP_STATUS.BAD_REQUEST);
    return;
  }
  if (err.name === "CastError") {
    sendError(res, "Invalid ID format", HTTP_STATUS.BAD_REQUEST);
    return;
  }
  sendError(res, "Internal server error", HTTP_STATUS.INTERNAL_SERVER);
};

export const notFound = (req: Request, res: Response): void => {
  sendError(
    res,
    `Route ${req.method} ${req.url} not found`,
    HTTP_STATUS.NOT_FOUND
  );
};