import Joi from "joi";

export const createItemSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(2000).required(),
  category: Joi.string().required(),
  subCategory: Joi.string().optional(),
  dailyRate: Joi.number().min(1).required(),
  currency: Joi.string().default("CAD"),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    country: Joi.string().default("Canada"),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).optional(),
  }).required(),
  condition: Joi.string().valid("new", "like_new", "good", "fair").required(),
  tags: Joi.array().items(Joi.string()).optional(),
});

export const updateItemSchema = Joi.object({
  title: Joi.string().min(5).max(100).optional(),
  description: Joi.string().min(20).max(2000).optional(),
  category: Joi.string().optional(),
  subCategory: Joi.string().optional(),
  dailyRate: Joi.number().min(1).optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    province: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number(),
    }).optional(),
  }).optional(),
  condition: Joi.string().valid("new", "like_new", "good", "fair").optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  "availability.isAvailable": Joi.boolean().optional(),
});

export const updateAvailabilitySchema = Joi.object({
  isAvailable: Joi.boolean().optional(),
  blockedDates: Joi.array().items(Joi.date()).optional(),
});

export const itemQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  category: Joi.string().optional(),
  city: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().optional(),
  condition: Joi.string().valid("new", "like_new", "good", "fair").optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string()
    .valid("dailyRate", "createdAt", "averageRating")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});