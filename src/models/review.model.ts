import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  type: "renter_to_owner" | "owner_to_renter" | "renter_to_item";
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User" },
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    type: {
      type: String,
      enum: ["renter_to_owner", "owner_to_renter", "renter_to_item"],
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per booking per type
ReviewSchema.index({ booking: 1, type: 1 }, { unique: true });
ReviewSchema.index({ reviewee: 1 });
ReviewSchema.index({ item: 1 });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);