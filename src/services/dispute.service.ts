import { DisputeRepository } from "../repository/dispute.repository";
import { BookingRepository } from "../repository/booking.repository";
import { uploadToS3 } from "../helpers/s3.helper";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS } from "../config/constants";
import { IDispute, DisputeReason, DisputeStatus } from "../models/dispute.model";
import { buildPagination } from "../helpers/pagination.helper";
import { notificationService } from "../services/notification.service";
import mongoose from "mongoose";

const disputeRepo = new DisputeRepository();
const bookingRepo = new BookingRepository();

export class DisputeService {
  async createDispute(
    userId: string,
    data: {
      bookingId: string;
      reason: DisputeReason;
      description: string;
    }
  ) {
    const booking = await bookingRepo.findById(data.bookingId);
    if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

    const isParty =
      booking.renter._id.toString() === userId ||
      booking.owner._id.toString() === userId;
    if (!isParty) throw new AppError("Access denied", HTTP_STATUS.FORBIDDEN);

    if (!["accepted", "active", "completed"].includes(booking.status)) {
      throw new AppError(
        "Disputes can only be raised for active or completed bookings",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const alreadyExists = await disputeRepo.existsByBookingAndUser(
      data.bookingId,
      userId
    );
    if (alreadyExists) {
      throw new AppError(
        "You have already raised a dispute for this booking",
        HTTP_STATUS.CONFLICT
      );
    }

    const reportedAgainst =
      booking.renter._id.toString() === userId
        ? booking.owner._id
        : booking.renter._id;

    const dispute = await disputeRepo.create({
      booking: new mongoose.Types.ObjectId(data.bookingId),
      reportedBy: new mongoose.Types.ObjectId(userId),
      reportedAgainst,
      reason: data.reason,
      description: data.description,
    });

    // Notify the other party
    notificationService
      .send({
        userId: reportedAgainst.toString(),
        type: "dispute_opened",
        title: "Dispute Raised",
        body: "A dispute has been raised for one of your bookings",
        data: { disputeId: dispute._id.toString(), screen: "dispute_detail" },
      })
      .catch(() => {});

    return dispute;
  }

  async getMyDisputes(userId: string, page = 1, limit = 10) {
    const { disputes, total } = await disputeRepo.findByUser(userId, page, limit);
    return { disputes, pagination: buildPagination(total, page, limit) };
  }

  async getDisputeById(disputeId: string, userId: string) {
    const dispute = await disputeRepo.findById(disputeId);
    if (!dispute) throw new AppError("Dispute not found", HTTP_STATUS.NOT_FOUND);

    const isParty =
      dispute.reportedBy._id.toString() === userId ||
      dispute.reportedAgainst._id.toString() === userId;
    if (!isParty) throw new AppError("Access denied", HTTP_STATUS.FORBIDDEN);

    return dispute;
  }

  async uploadEvidence(
    disputeId: string,
    userId: string,
    files: Express.Multer.File[]
  ) {
    const dispute = await disputeRepo.findById(disputeId);
    if (!dispute) throw new AppError("Dispute not found", HTTP_STATUS.NOT_FOUND);

    const isParty =
      dispute.reportedBy._id.toString() === userId ||
      dispute.reportedAgainst._id.toString() === userId;
    if (!isParty) throw new AppError("Access denied", HTTP_STATUS.FORBIDDEN);

    if (dispute.status !== "open" && dispute.status !== "under_review") {
      throw new AppError(
        "Evidence can only be added to open disputes",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const urls = await Promise.all(
      files.map((f) =>
        uploadToS3(f.buffer, f.mimetype, `disputes/${disputeId}/evidence`)
      )
    );

    return disputeRepo.addEvidence(disputeId, urls);
  }

  async cancelDispute(disputeId: string, userId: string) {
    const dispute = await disputeRepo.findById(disputeId);
    if (!dispute) throw new AppError("Dispute not found", HTTP_STATUS.NOT_FOUND);
    if (dispute.reportedBy._id.toString() !== userId) {
      throw new AppError("Only the reporter can cancel a dispute", HTTP_STATUS.FORBIDDEN);
    }
    if (dispute.status !== "open") {
      throw new AppError("Only open disputes can be cancelled", HTTP_STATUS.BAD_REQUEST);
    }
    return disputeRepo.updateStatus(disputeId, "closed");
  }

  // ── Admin methods ──────────────────────────────────────────

  async getAllDisputes(status?: string, page = 1, limit = 10) {
    const { disputes, total } = await disputeRepo.findAll(status, page, limit);
    return { disputes, pagination: buildPagination(total, page, limit) };
  }

  async getDisputeByIdAdmin(disputeId: string) {
    const dispute = await disputeRepo.findById(disputeId);
    if (!dispute) throw new AppError("Dispute not found", HTTP_STATUS.NOT_FOUND);
    return dispute;
  }

  async resolveDispute(
    disputeId: string,
    adminId: string,
    data: { status: DisputeStatus; adminNote?: string }
  ) {
    const dispute = await disputeRepo.findById(disputeId);
    if (!dispute) throw new AppError("Dispute not found", HTTP_STATUS.NOT_FOUND);
    if (dispute.status === "closed") {
      throw new AppError("Dispute is already closed", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await disputeRepo.updateStatus(disputeId, data.status, {
      adminNote: data.adminNote,
      resolvedBy: new mongoose.Types.ObjectId(adminId),
      resolvedAt: new Date(),
    } as any);

    // Notify both parties
    const notifyBoth = async () => {
      const msg = `Your dispute has been resolved: ${data.status.replace(/_/g, " ")}`;
      await Promise.all([
        notificationService.send({
          userId: dispute.reportedBy._id.toString(),
          type: "dispute_resolved",
          title: "Dispute Resolved",
          body: msg,
          data: { disputeId, screen: "dispute_detail" },
        }),
        notificationService.send({
          userId: dispute.reportedAgainst._id.toString(),
          type: "dispute_resolved",
          title: "Dispute Resolved",
          body: msg,
          data: { disputeId, screen: "dispute_detail" },
        }),
      ]);
    };
    notifyBoth().catch(() => {});

    return updated;
  }

  async updateDisputeStatus(
    disputeId: string,
    status: DisputeStatus
  ) {
    const dispute = await disputeRepo.findById(disputeId);
    if (!dispute) throw new AppError("Dispute not found", HTTP_STATUS.NOT_FOUND);
    return disputeRepo.updateStatus(disputeId, status);
  }
}