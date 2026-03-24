import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../helpers/jwt.helper";
import { sendError } from "../helpers/response.helper";
import { HTTP_STATUS } from "../config/constants";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Access token required", HTTP_STATUS.UNAUTHORIZED);
      return;
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired access token", HTTP_STATUS.UNAUTHORIZED);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(
        res,
        "You do not have permission to perform this action",
        HTTP_STATUS.FORBIDDEN
      );
      return;
    }
    next();
  };
};