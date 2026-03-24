import { OtpModel } from "../models/otp.model";
import { IOtp } from "../types";

export class OtpRepository {
  async create(data: Partial<IOtp>): Promise<IOtp> {
    await OtpModel.deleteMany({ userId: data.userId, type: data.type });
    return OtpModel.create(data);
  }

  async findValid(
    userId: string,
    otp: string,
    type: IOtp["type"]
  ): Promise<IOtp | null> {
    return OtpModel.findOne({
      userId,
      otp,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).exec();
  }

  async markUsed(id: string): Promise<void> {
    await OtpModel.findByIdAndUpdate(id, { isUsed: true });
  }
}