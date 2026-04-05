import { EcoImpactModel, IEcoImpact } from "../models/eco.model";

export class EcoRepository {
  async create(data: Partial<IEcoImpact>): Promise<IEcoImpact> {
    return EcoImpactModel.create(data);
  }

  async existsByBooking(bookingId: string): Promise<boolean> {
    const count = await EcoImpactModel.countDocuments({ booking: bookingId });
    return count > 0;
  }

  async findByBooking(bookingId: string): Promise<IEcoImpact | null> {
    return EcoImpactModel.findOne({ booking: bookingId });
  }

  async getUserImpact(userId: string, period?: "month" | "year") {
    const match: Record<string, any> = { user: userId };

    if (period) {
      const now = new Date();
      const from = new Date();
      if (period === "month") from.setMonth(now.getMonth() - 1);
      if (period === "year") from.setFullYear(now.getFullYear() - 1);
      match.createdAt = { $gte: from };
    }

    const result = await EcoImpactModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCO2: { $sum: "$co2SavedKg" },
          totalKm: { $sum: "$kmEquivalent" },
          totalRentals: { $sum: 1 },
        },
      },
    ]);

    if (!result.length) return { totalCO2: 0, totalKm: 0, totalRentals: 0 };
    return {
      totalCO2: parseFloat(result[0].totalCO2.toFixed(2)),
      totalKm: parseFloat(result[0].totalKm.toFixed(1)),
      totalRentals: result[0].totalRentals,
    };
  }

  async getUserLeaderboard(limit = 10): Promise<any[]> {
    return EcoImpactModel.aggregate([
      {
        $group: {
          _id: "$user",
          totalCO2: { $sum: "$co2SavedKg" },
          totalRentals: { $sum: 1 },
        },
      },
      { $sort: { totalCO2: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          totalCO2: { $round: ["$totalCO2", 2] },
          totalRentals: 1,
          "user.firstName": 1,
          "user.lastName": 1,
          "user.profilePhoto": 1,
          "user.location.city": 1,
        },
      },
    ]);
  }

  async getCityLeaderboard(limit = 10): Promise<any[]> {
    return EcoImpactModel.aggregate([
      {
        $group: {
          _id: "$city",
          province: { $first: "$province" },
          totalCO2: { $sum: "$co2SavedKg" },
          totalRentals: { $sum: 1 },
        },
      },
      { $sort: { totalCO2: -1 } },
      { $limit: limit },
      {
        $project: {
          city: "$_id",
          province: 1,
          totalCO2: { $round: ["$totalCO2", 2] },
          totalRentals: 1,
          _id: 0,
        },
      },
    ]);
  }
}