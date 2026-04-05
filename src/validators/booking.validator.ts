import Joi from "joi";

export const createBookingSchema = Joi.object({
  itemId: Joi.string().required(),
  startDate: Joi.date().min("now").required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  deliveryType: Joi.string().valid("pickup", "delivery").required(),
  deliveryAddress: Joi.when("deliveryType", {
    is: "delivery",
    then: Joi.object({
      label: Joi.string().optional(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      province: Joi.string().required(),
      country: Joi.string().default("Canada"),
      coordinates: Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional(),
      }).optional(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  pickupTimeFrom: Joi.when("deliveryType", {
    is: "pickup",
    then: Joi.string().optional(),
    otherwise: Joi.forbidden(),
  }),
  pickupTimeTo: Joi.when("deliveryType", {
    is: "pickup",
    then: Joi.string().optional(),
    otherwise: Joi.forbidden(),
  }),
  discountCode: Joi.string().optional(),
});

export const declineBookingSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});

export const cancelBookingSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});

export const bookingQuerySchema = Joi.object({
  status: Joi.string()
    .valid("pending", "accepted", "active", "completed", "declined", "cancelled")
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});