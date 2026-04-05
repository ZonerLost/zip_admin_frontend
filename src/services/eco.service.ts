import { EcoRepository } from "../repository/eco.repository";
import { BookingModel } from "../models/booking.model";
import { ItemModel } from "../models/item.model";
import {
  calculateCO2Saved,
  co2ToKmEquivalent,
  CO2_BY_CATEGORY,
} from "../models/eco.model";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS } from "../config/constants";
import mongoose from "mongoose";

const ecoRepo = new EcoRepository();

// Badge thresholds in kg CO2
const BADGES = [
  { id: "eco_starter", label: "Eco Starter", minCO2: 0 },
  { id: "green_achiever", label: "Green Achiever", minCO2: 50 },
  { id: "planet_hero", label: "Planet Hero", minCO2: 200 },
  { id: "impact_legend", label: "Impact Legend", minCO2: 500 },
];

function getBadge(totalCO2: number) {
  return [...BADGES].reverse().find((b) => totalCO2 >= b.minCO2) ?? BADGES[0];
}

export class EcoService {
  // Called internally when a booking is completed
  async recordEcoImpact(bookingId: string): Promise<void> {
    const already = await ecoRepo.existsByBooking(bookingId);
    if (already) return;

    const booking = await BookingModel.findById(bookingId).populate("item");
    if (!booking) return;

    const item = await ItemModel.findById(booking.item);
    if (!item) return;

    const co2SavedKg = calculateCO2Saved(item.category);
    const kmEquivalent = co2ToKmEquivalent(co2SavedKg);

    await ecoRepo.create({
      user: booking.renter,
      booking: new mongoose.Types.ObjectId(bookingId),
      item: item._id,
      category: item.category,
      co2SavedKg,
      kmEquivalent,
      city: item.location.city,
      province: item.location.province,
    });
  }

  async getMyImpact(userId: string, period?: "month" | "year") {
    const [lifetime, periodStats] = await Promise.all([
      ecoRepo.getUserImpact(userId),
      period ? ecoRepo.getUserImpact(userId, period) : null,
    ]);

    const badge = getBadge(lifetime.totalCO2);
    const nextBadge = BADGES.find((b) => b.minCO2 > lifetime.totalCO2);

    return {
      lifetime: {
        ...lifetime,
        equivalence: `${lifetime.totalKm} km by car`,
      },
      ...(periodStats && {
        period: {
          type: period,
          ...periodStats,
          equivalence: `${periodStats.totalKm} km by car`,
        },
      }),
      badge,
      nextBadge: nextBadge
        ? {
            ...nextBadge,
            co2Remaining: parseFloat(
              (nextBadge.minCO2 - lifetime.totalCO2).toFixed(2)
            ),
          }
        : null,
    };
  }

  async getBookingImpact(bookingId: string, userId: string) {
    const booking = await BookingModel.findOne({
      _id: bookingId,
      $or: [{ renter: userId }, { owner: userId }],
    });
    if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

    const impact = await ecoRepo.findByBooking(bookingId);
    if (!impact) {
      throw new AppError(
        "No eco impact recorded for this booking yet",
        HTTP_STATUS.NOT_FOUND
      );
    }

    return {
      ...impact.toObject(),
      message: `By renting this item, you saved ${impact.co2SavedKg} kg of CO₂, equivalent to ${impact.kmEquivalent} km by car`,
    };
  }

  async getUserLeaderboard(limit = 10) {
    return ecoRepo.getUserLeaderboard(limit);
  }

  async getCityLeaderboard(limit = 10) {
    return ecoRepo.getCityLeaderboard(limit);
  }

  getCategories() {
    return Object.entries(CO2_BY_CATEGORY).map(([category, co2Kg]) => ({
      category,
      co2SavedKg: co2Kg,
      kmEquivalent: co2ToKmEquivalent(co2Kg),
      description: `Renting saves ${co2Kg} kg CO₂ (= ${co2ToKmEquivalent(co2Kg)} km by car)`,
    }));
  }
}