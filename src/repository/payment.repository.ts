import {
  PaymentModel,
  IPayment,
  SavedPaymentMethodModel,
  ISavedPaymentMethod,
  PaymentStatus,
} from "../models/payment.model";

export class PaymentRepository {
  // ── Payments ──────────────────────────────────────────────

  async create(data: Partial<IPayment>): Promise<IPayment> {
    return PaymentModel.create(data);
  }

  async findById(id: string): Promise<IPayment | null> {
    return PaymentModel.findById(id)
      .populate("booking", "startDate endDate totalDays item")
      .populate("payer", "firstName lastName")
      .populate("payee", "firstName lastName");
  }

  async findByBooking(bookingId: string): Promise<IPayment | null> {
    return PaymentModel.findOne({ booking: bookingId });
  }

  async findByPayer(
    payerId: string,
    page = 1,
    limit = 10
  ): Promise<{ payments: IPayment[]; total: number }> {
    const [payments, total] = await Promise.all([
      PaymentModel.find({ payer: payerId })
        .populate("booking", "startDate endDate item")
        .populate("payee", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PaymentModel.countDocuments({ payer: payerId }),
    ]);
    return { payments, total };
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    extra: Partial<IPayment> = {}
  ): Promise<IPayment | null> {
    return PaymentModel.findByIdAndUpdate(
      id,
      { status, ...extra },
      { new: true }
    );
  }

  // ── Saved Payment Methods ─────────────────────────────────

  async saveMethod(data: Partial<ISavedPaymentMethod>): Promise<ISavedPaymentMethod> {
    // If new method is default, unset others
    if (data.isDefault) {
      await SavedPaymentMethodModel.updateMany(
        { user: data.user },
        { isDefault: false }
      );
    }
    return SavedPaymentMethodModel.create(data);
  }

  async getMethodsByUser(userId: string): Promise<ISavedPaymentMethod[]> {
    return SavedPaymentMethodModel.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async deleteMethod(id: string, userId: string): Promise<void> {
    await SavedPaymentMethodModel.findOneAndDelete({ _id: id, user: userId });
  }

  async setDefaultMethod(id: string, userId: string): Promise<void> {
    await SavedPaymentMethodModel.updateMany({ user: userId }, { isDefault: false });
    await SavedPaymentMethodModel.findOneAndUpdate(
      { _id: id, user: userId },
      { isDefault: true }
    );
  }
}