import { PaymentRepository } from "../repository/payment.repository";
import { BookingRepository } from "../repository/booking.repository";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS } from "../config/constants";
import { PaymentMethod } from "../models/payment.model";
import { buildPagination } from "../helpers/pagination.helper";
import { notificationService } from "../services/notification.service";
import mongoose from "mongoose";

const paymentRepo = new PaymentRepository();
const bookingRepo = new BookingRepository();

function getId(value: any): string {
  if (!value) return "";
  if (typeof value === "object" && value._id) return value._id.toString();
  return value.toString();
}

export class PaymentService {
  async recordPayment(
    payerId: string,
    data: {
      bookingId: string;
      method: PaymentMethod;
      externalReference?: string;
    }
  ) {
    const booking = await bookingRepo.findById(data.bookingId);
    if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

    if (getId(booking.renter) !== payerId) {
      throw new AppError("Only the renter can record a payment", HTTP_STATUS.FORBIDDEN);
    }

    if (!["accepted", "active", "completed"].includes(booking.status)) {
      throw new AppError(
        "Payment can only be recorded for accepted, active or completed bookings",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existing = await paymentRepo.findByBooking(data.bookingId);
    if (existing && existing.status === "completed") {
      throw new AppError("Payment already recorded for this booking", HTTP_STATUS.CONFLICT);
    }

    const payment = await paymentRepo.create({
      booking: new mongoose.Types.ObjectId(data.bookingId),
      payer: new mongoose.Types.ObjectId(payerId),
      payee: new mongoose.Types.ObjectId(getId(booking.owner)),
      amount: booking.pricing.totalAmount,
      currency: "CAD",
      method: data.method,
      status: "completed",
      externalReference: data.externalReference,
    });

    notificationService.send({
      userId: getId(booking.owner),
      type: "payment_received",
      title: "Payment Received",
      body: `You received $${booking.pricing.totalAmount} CAD for your rental`,
      data: { bookingId: data.bookingId, paymentId: payment._id.toString() },
    }).catch(() => {});

    return payment;
  }

  async getMyTransactions(userId: string, page = 1, limit = 10) {
    const { payments, total } = await paymentRepo.findByPayer(userId, page, limit);
    return { payments, pagination: buildPagination(total, page, limit) };
  }

  async getPaymentById(paymentId: string, userId: string) {
    const payment = await paymentRepo.findById(paymentId);
    if (!payment) throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND);

    const isParty =
      getId(payment.payer) === userId ||
      getId(payment.payee) === userId;
    if (!isParty) throw new AppError("Access denied", HTTP_STATUS.FORBIDDEN);

    return payment;
  }

  async savePaymentMethod(
    userId: string,
    data: {
      type: PaymentMethod;
      label: string;
      isDefault: boolean;
      card?: {
        last4: string;
        brand: string;
        expiryMonth: number;
        expiryYear: number;
      };
    }
  ) {
    return paymentRepo.saveMethod({
      user: new mongoose.Types.ObjectId(userId),
      ...data,
    });
  }

  async getMyPaymentMethods(userId: string) {
    return paymentRepo.getMethodsByUser(userId);
  }

  async deletePaymentMethod(methodId: string, userId: string) {
    await paymentRepo.deleteMethod(methodId, userId);
  }

  async setDefaultPaymentMethod(methodId: string, userId: string) {
    await paymentRepo.setDefaultMethod(methodId, userId);
  }
}