import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError } from "../helpers/response.helper";
import { HTTP_STATUS } from "../config/constants";

export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errors = error.details.map((d) => d.message);
      sendError(res, "Validation failed", HTTP_STATUS.BAD_REQUEST, errors);
      return;
    }
    req[source] = value;
    next();
  };
};