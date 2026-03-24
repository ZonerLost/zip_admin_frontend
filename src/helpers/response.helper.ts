import { Response } from "express";
import { ApiResponse, PaginationMeta } from "../types";
import { HTTP_STATUS } from "../config/constants";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = HTTP_STATUS.OK,
  pagination?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = { success: true, message, data, pagination };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  message: string,
  data?: T
): Response => {
  return sendSuccess(res, message, data, HTTP_STATUS.CREATED);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER,
  errors?: unknown
): Response => {
  const response: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
};