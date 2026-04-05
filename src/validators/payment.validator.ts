import Joi from "joi";

export const recordPaymentSchema = Joi.object({
  bookingId: Joi.string().required(),
  method: Joi.string()
    .valid("apple_pay", "google_pay", "credit_card", "debit_card")
    .required(),
  externalReference: Joi.string().optional(),
  // TODO: Add stripePaymentIntentId when Stripe is integrated
});

export const savePaymentMethodSchema = Joi.object({
  type: Joi.string()
    .valid("apple_pay", "google_pay", "credit_card", "debit_card")
    .required(),
  label: Joi.string().required(),
  isDefault: Joi.boolean().default(false),
  card: Joi.when("type", {
    is: Joi.valid("credit_card", "debit_card"),
    then: Joi.object({
      last4: Joi.string().length(4).required(),
      brand: Joi.string().required(),
      expiryMonth: Joi.number().min(1).max(12).required(),
      expiryYear: Joi.number().min(2024).required(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
});

export const paymentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});