import crypto from "crypto";
import { CONSTANTS } from "../config/constants";

export const generateOTP = (): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < CONSTANTS.OTP_LENGTH; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

export const getOTPExpiry = (minutes?: number): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + (minutes || 10));
  return expiry;
};