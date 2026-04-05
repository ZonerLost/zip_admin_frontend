import Joi from "joi";

export const createDisputeSchema = Joi.object({
  bookingId: Joi.string().required(),
  reason: Joi.string()
    .valid(
      "item_damaged",
      "item_not_returned",
      "item_not_as_described",
      "late_return",
      "no_show",
      "payment_issue",
      "other"
    )
    .required(),
  description: Joi.string().min(20).max(2000).required(),
});

export const resolveDisputeSchema = Joi.object({
  status: Joi.string()
    .valid("resolved_for_renter", "resolved_for_owner", "resolved_mutually", "closed")
    .required(),
  adminNote: Joi.string().max(2000).optional(),
});

export const disputeQuerySchema = Joi.object({
  status: Joi.string()
    .valid("open", "under_review", "resolved_for_renter", "resolved_for_owner", "resolved_mutually", "closed")
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});