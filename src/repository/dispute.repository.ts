import { DisputeModel, IDispute, DisputeStatus } from "../models/dispute.model";

export class DisputeRepository {
  async create(data: Partial<IDispute>): Promise<IDispute> {
    return DisputeModel.create(data);
  }

  async findById(id: string): Promise<IDispute | null> {
    return DisputeModel.findById(id)
      .populate("booking", "startDate endDate item status")
      .populate("reportedBy", "firstName lastName profilePhoto")
      .populate("reportedAgainst", "firstName lastName profilePhoto")
      .populate("resolvedBy", "firstName lastName");
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ disputes: IDispute[]; total: number }> {
    const [disputes, total] = await Promise.all([
      DisputeModel.find({ reportedBy: userId })
        .populate("booking", "startDate endDate status")
        .populate("reportedAgainst", "firstName lastName profilePhoto")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      DisputeModel.countDocuments({ reportedBy: userId }),
    ]);
    return { disputes, total };
  }

  async existsByBookingAndUser(bookingId: string, userId: string): Promise<boolean> {
    const count = await DisputeModel.countDocuments({
      booking: bookingId,
      reportedBy: userId,
    });
    return count > 0;
  }

  async updateStatus(
    id: string,
    status: DisputeStatus,
    extra: Partial<IDispute> = {}
  ): Promise<IDispute | null> {
    return DisputeModel.findByIdAndUpdate(
      id,
      { status, ...extra },
      { new: true }
    );
  }

  async addEvidence(id: string, urls: string[]): Promise<IDispute | null> {
    return DisputeModel.findByIdAndUpdate(
      id,
      { $push: { evidence: { $each: urls } } },
      { new: true }
    );
  }

  // Admin methods
  async findAll(
    status?: string,
    page = 1,
    limit = 10
  ): Promise<{ disputes: IDispute[]; total: number }> {
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const [disputes, total] = await Promise.all([
      DisputeModel.find(filter)
        .populate("booking", "startDate endDate status")
        .populate("reportedBy", "firstName lastName email")
        .populate("reportedAgainst", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      DisputeModel.countDocuments(filter),
    ]);
    return { disputes, total };
  }
}