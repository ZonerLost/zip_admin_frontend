import mongoose, { Schema } from "mongoose";
import { IRefreshToken } from "../types";

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
    deviceInfo: { type: String },
  },
  { timestamps: true }
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ userId: 1 });

export const RefreshTokenModel = mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema
);