import bcrypt from "bcryptjs";
import { CONSTANTS } from "../config/constants";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, CONSTANTS.BCRYPT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};