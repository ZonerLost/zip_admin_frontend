import { BookingModel } from "../models/booking.model";
import { ItemModel } from "../models/item.model";
import { ReviewModel } from "../models/review.model";
import { PaymentModel } from "../models/payment.model";
import { EcoImpactModel } from "../models/eco.model";
import mongoose from "mongoose";

export class DashboardService {
  async getUserDashboard(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [
      itemStats,
      rentalStats,
      lendingStats,
      earningsStats,
      ecoStats,
      ratingStats,
      recentBookings,
      recentListings,
    ] = await Promise.all([
      // Items listed by user
      ItemModel.aggregate([
        { $match: { owner: userObjectId, isActive: true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: ["$availability.isAvailable", 1, 0] } },
          },
        },
      ]),

      // Bookings as renter
      BookingModel.aggregate([
        { $match: { renter: userObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Bookings as owner (lending)
      BookingModel.aggregate([
        { $match: { owner: userObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Total earnings as owner (completed payments)
      PaymentModel.aggregate([
        { $match: { payee: userObjectId, status: "completed" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      // Eco impact
      EcoImpactModel.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: null,
            totalCO2: { $sum: "$co2SavedKg" },
            totalKm: { $sum: "$kmEquivalent" },
            totalRentals: { $sum: 1 },
          },
        },
      ]),

      // Rating stats
      ReviewModel.aggregate([
        { $match: { reviewee: userObjectId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]),

      // Recent 5 bookings as renter
      BookingModel.find({ renter: userObjectId })
        .populate("item", "title photos dailyRate")
        .populate("owner", "firstName lastName profilePhoto")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("status startDate endDate pricing totalDays"),

      // Recent 5 listings
      ItemModel.find({ owner: userObjectId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title photos dailyRate averageRating totalRentals availability.isAvailable"),
    ]);

    // Build rental status map
    const rentalStatusMap = Object.fromEntries(
      rentalStats.map((s: any) => [s._id, s.count])
    );
    const lendingStatusMap = Object.fromEntries(
      lendingStats.map((s: any) => [s._id, s.count])
    );

    return {
      items: {
        total: itemStats[0]?.total ?? 0,
        available: itemStats[0]?.available ?? 0,
      },
      rentals: {
        total: rentalStats.reduce((acc: number, s: any) => acc + s.count, 0),
        active: (rentalStatusMap["active"] ?? 0) + (rentalStatusMap["accepted"] ?? 0),
        completed: rentalStatusMap["completed"] ?? 0,
        pending: rentalStatusMap["pending"] ?? 0,
      },
      lending: {
        total: lendingStats.reduce((acc: number, s: any) => acc + s.count, 0),
        active: (lendingStatusMap["active"] ?? 0) + (lendingStatusMap["accepted"] ?? 0),
        completed: lendingStatusMap["completed"] ?? 0,
        pending: lendingStatusMap["pending"] ?? 0,
      },
      earnings: {
        total: parseFloat((earningsStats[0]?.total ?? 0).toFixed(2)),
        currency: "CAD",
        totalTransactions: earningsStats[0]?.count ?? 0,
      },
      eco: {
        totalCO2Saved: parseFloat((ecoStats[0]?.totalCO2 ?? 0).toFixed(2)),
        totalKmEquivalent: parseFloat((ecoStats[0]?.totalKm ?? 0).toFixed(1)),
        totalRentals: ecoStats[0]?.totalRentals ?? 0,
        equivalence: `${parseFloat((ecoStats[0]?.totalKm ?? 0).toFixed(1))} km by car`,
      },
      rating: {
        average: parseFloat((ratingStats[0]?.averageRating ?? 0).toFixed(1)),
        total: ratingStats[0]?.totalReviews ?? 0,
      },
      recentBookings,
      recentListings,
    };
  }
}