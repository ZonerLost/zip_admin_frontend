import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { JwtPayload } from "../types";

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JwtPayload;
};