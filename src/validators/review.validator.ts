import Joi from "joi";

export const createReviewSchema = Joi.object({
  bookingId: Joi.string().required(),
  type: Joi.string()
    .valid("renter_to_owner", "owner_to_renter", "renter_to_item")
    .required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(1000).required(),
});

export const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});