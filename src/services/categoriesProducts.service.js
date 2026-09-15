const DAY_MS = 24 * 60 * 60 * 1000;

const PRODUCT_CATALOG = [
  {
    id: "product_tent",
    name: "Tent",
    categoryId: "cat_outdoors",
    categoryName: "Outdoors & Nature",
    subCategoryId: "sub_camping",
    subCategoryName: "Camping",
    baseItems: 52,
    boostRate: 0.28,
    monthlyViews: 1860,
    monthlyBookings: 94,
    baseLeadTimeDays: 14,
    baseRentalDuration: 3.8,
    baseAvailability: 0.71,
    baseRating: 4.78,
    reviewRate: 0.62,
    dailyRate: 42,
    seed: 0.31,
  },
  {
    id: "product_sleeping_bag",
    name: "Sleeping bag",
    categoryId: "cat_outdoors",
    categoryName: "Outdoors & Nature",
    subCategoryId: "sub_camping",
    subCategoryName: "Camping",
    baseItems: 46,
    boostRate: 0.18,
    monthlyViews: 1240,
    monthlyBookings: 72,
    baseLeadTimeDays: 11,
    baseRentalDuration: 3.1,
    baseAvailability: 0.76,
    baseRating: 4.62,
    reviewRate: 0.54,
    dailyRate: 18,
    seed: 0.67,
  },
  {
    id: "product_kayak",
    name: "Kayak",
    categoryId: "cat_outdoors",
    categoryName: "Outdoors & Nature",
    subCategoryId: "sub_water_sports",
    subCategoryName: "Water Sports",
    baseItems: 24,
    boostRate: 0.35,
    monthlyViews: 1430,
    monthlyBookings: 51,
    baseLeadTimeDays: 9,
    baseRentalDuration: 2.4,
    baseAvailability: 0.63,
    baseRating: 4.71,
    reviewRate: 0.49,
    dailyRate: 58,
    seed: 1.02,
  },
  {
    id: "product_paddle_board",
    name: "Paddle board",
    categoryId: "cat_outdoors",
    categoryName: "Outdoors & Nature",
    subCategoryId: "sub_water_sports",
    subCategoryName: "Water Sports",
    baseItems: 29,
    boostRate: 0.32,
    monthlyViews: 1380,
    monthlyBookings: 48,
    baseLeadTimeDays: 8,
    baseRentalDuration: 2.1,
    baseAvailability: 0.61,
    baseRating: 4.55,
    reviewRate: 0.45,
    dailyRate: 49,
    seed: 1.38,
  },
  {
    id: "product_power_drill",
    name: "Power drill",
    categoryId: "cat_tools",
    categoryName: "Tools & DIY",
    subCategoryId: "sub_power_tools",
    subCategoryName: "Power Tools",
    baseItems: 64,
    boostRate: 0.22,
    monthlyViews: 1520,
    monthlyBookings: 110,
    baseLeadTimeDays: 6,
    baseRentalDuration: 1.7,
    baseAvailability: 0.69,
    baseRating: 4.63,
    reviewRate: 0.39,
    dailyRate: 24,
    seed: 1.74,
  },
  {
    id: "product_pressure_washer",
    name: "Pressure washer",
    categoryId: "cat_tools",
    categoryName: "Tools & DIY",
    subCategoryId: "sub_power_tools",
    subCategoryName: "Power Tools",
    baseItems: 31,
    boostRate: 0.25,
    monthlyViews: 980,
    monthlyBookings: 56,
    baseLeadTimeDays: 5,
    baseRentalDuration: 1.9,
    baseAvailability: 0.66,
    baseRating: 4.51,
    reviewRate: 0.44,
    dailyRate: 36,
    seed: 2.07,
  },
  {
    id: "product_lawn_mower",
    name: "Lawn mower",
    categoryId: "cat_tools",
    categoryName: "Tools & DIY",
    subCategoryId: "sub_garden_equipment",
    subCategoryName: "Garden Equipment",
    baseItems: 22,
    boostRate: 0.21,
    monthlyViews: 760,
    monthlyBookings: 34,
    baseLeadTimeDays: 4,
    baseRentalDuration: 1.5,
    baseAvailability: 0.58,
    baseRating: 4.39,
    reviewRate: 0.37,
    dailyRate: 41,
    seed: 2.41,
  },
  {
    id: "product_hedge_trimmer",
    name: "Hedge trimmer",
    categoryId: "cat_tools",
    categoryName: "Tools & DIY",
    subCategoryId: "sub_garden_equipment",
    subCategoryName: "Garden Equipment",
    baseItems: 18,
    boostRate: 0.19,
    monthlyViews: 620,
    monthlyBookings: 28,
    baseLeadTimeDays: 5,
    baseRentalDuration: 1.4,
    baseAvailability: 0.6,
    baseRating: 4.34,
    reviewRate: 0.34,
    dailyRate: 33,
    seed: 2.79,
  },
  {
    id: "product_dslr_camera",
    name: "DSLR camera",
    categoryId: "cat_electronics",
    categoryName: "Electronics & Media",
    subCategoryId: "sub_cameras",
    subCategoryName: "Cameras & Photography",
    baseItems: 27,
    boostRate: 0.4,
    monthlyViews: 1710,
    monthlyBookings: 69,
    baseLeadTimeDays: 10,
    baseRentalDuration: 2.8,
    baseAvailability: 0.62,
    baseRating: 4.81,
    reviewRate: 0.57,
    dailyRate: 71,
    seed: 3.05,
  },
  {
    id: "product_action_camera",
    name: "Action camera",
    categoryId: "cat_electronics",
    categoryName: "Electronics & Media",
    subCategoryId: "sub_cameras",
    subCategoryName: "Cameras & Photography",
    baseItems: 21,
    boostRate: 0.36,
    monthlyViews: 1490,
    monthlyBookings: 61,
    baseLeadTimeDays: 8,
    baseRentalDuration: 3.4,
    baseAvailability: 0.68,
    baseRating: 4.73,
    reviewRate: 0.59,
    dailyRate: 39,
    seed: 3.36,
  },
  {
    id: "product_projector",
    name: "Projector",
    categoryId: "cat_electronics",
    categoryName: "Electronics & Media",
    subCategoryId: "sub_event_tech",
    subCategoryName: "Event Tech",
    baseItems: 19,
    boostRate: 0.34,
    monthlyViews: 1180,
    monthlyBookings: 43,
    baseLeadTimeDays: 12,
    baseRentalDuration: 2.2,
    baseAvailability: 0.64,
    baseRating: 4.69,
    reviewRate: 0.55,
    dailyRate: 64,
    seed: 3.72,
  },
  {
    id: "product_speaker_system",
    name: "Speaker system",
    categoryId: "cat_electronics",
    categoryName: "Electronics & Media",
    subCategoryId: "sub_event_tech",
    subCategoryName: "Event Tech",
    baseItems: 25,
    boostRate: 0.38,
    monthlyViews: 1310,
    monthlyBookings: 47,
    baseLeadTimeDays: 13,
    baseRentalDuration: 2.6,
    baseAvailability: 0.61,
    baseRating: 4.6,
    reviewRate: 0.52,
    dailyRate: 78,
    seed: 4.01,
  },
  {
    id: "product_folding_chair",
    name: "Folding chair",
    categoryId: "cat_home",
    categoryName: "Home & Events",
    subCategoryId: "sub_event_essentials",
    subCategoryName: "Event Essentials",
    baseItems: 140,
    boostRate: 0.12,
    monthlyViews: 690,
    monthlyBookings: 84,
    baseLeadTimeDays: 16,
    baseRentalDuration: 1.9,
    baseAvailability: 0.74,
    baseRating: 4.48,
    reviewRate: 0.28,
    dailyRate: 8,
    seed: 4.43,
  },
  {
    id: "product_event_table",
    name: "Event table",
    categoryId: "cat_home",
    categoryName: "Home & Events",
    subCategoryId: "sub_event_essentials",
    subCategoryName: "Event Essentials",
    baseItems: 64,
    boostRate: 0.15,
    monthlyViews: 540,
    monthlyBookings: 49,
    baseLeadTimeDays: 14,
    baseRentalDuration: 2.1,
    baseAvailability: 0.71,
    baseRating: 4.41,
    reviewRate: 0.31,
    dailyRate: 12,
    seed: 4.78,
  },
  {
    id: "product_espresso_machine",
    name: "Espresso machine",
    categoryId: "cat_home",
    categoryName: "Home & Events",
    subCategoryId: "sub_kitchen_appliances",
    subCategoryName: "Kitchen Appliances",
    baseItems: 17,
    boostRate: 0.29,
    monthlyViews: 910,
    monthlyBookings: 31,
    baseLeadTimeDays: 9,
    baseRentalDuration: 2,
    baseAvailability: 0.67,
    baseRating: 4.74,
    reviewRate: 0.5,
    dailyRate: 52,
    seed: 5.09,
  },
  {
    id: "product_stand_mixer",
    name: "Stand mixer",
    categoryId: "cat_home",
    categoryName: "Home & Events",
    subCategoryId: "sub_kitchen_appliances",
    subCategoryName: "Kitchen Appliances",
    baseItems: 14,
    boostRate: 0.24,
    monthlyViews: 530,
    monthlyBookings: 21,
    baseLeadTimeDays: 7,
    baseRentalDuration: 2.5,
    baseAvailability: 0.69,
    baseRating: 4.83,
    reviewRate: 0.46,
    dailyRate: 47,
    seed: 5.43,
  },
];

const SEASONALITY = {
  cat_outdoors: { peakMonth: 6, amplitude: 0.18 },
  cat_tools: { peakMonth: 4, amplitude: 0.12 },
  cat_electronics: { peakMonth: 10, amplitude: 0.1 },
  cat_home: { peakMonth: 11, amplitude: 0.08 },
};

function sleep(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function toDate(value, fallback) {
  const date =
    value instanceof Date ? new Date(value) : new Date(value || fallback);
  if (Number.isNaN(date.getTime())) return new Date(fallback);
  return date;
}

function getRangeMeta(start, end) {
  const fallbackEnd = new Date();
  const fallbackStart = new Date(fallbackEnd.getTime() - 6 * DAY_MS);
  let safeStart = toDate(start, fallbackStart);
  let safeEnd = toDate(end, fallbackEnd);

  if (safeStart.getTime() > safeEnd.getTime()) {
    [safeStart, safeEnd] = [safeEnd, safeStart];
  }

  const days = Math.max(
    1,
    Math.round((safeEnd.getTime() - safeStart.getTime()) / DAY_MS) + 1,
  );
  const months = days / 30;
  const midpoint = new Date(
    safeStart.getTime() + (safeEnd.getTime() - safeStart.getTime()) / 2,
  );

  return {
    days,
    months,
    midpoint,
    timeToken: midpoint.getFullYear() * 12 + midpoint.getMonth() + 1,
  };
}

function getSeasonalFactor(categoryId, meta) {
  const config = SEASONALITY[categoryId] || { peakMonth: 6, amplitude: 0.08 };
  const month = meta.midpoint.getMonth();
  const angle = ((month - config.peakMonth) / 12) * Math.PI * 2;
  return 1 + Math.cos(angle) * config.amplitude;
}

function buildProductRow(product, meta) {
  const seasonalFactor = getSeasonalFactor(product.categoryId, meta);
  const trendFactor =
    0.92 + Math.abs(Math.sin(meta.timeToken * 0.37 + product.seed)) * 0.16;
  const bookingFactor =
    0.9 + Math.abs(Math.cos(meta.timeToken * 0.23 + product.seed)) * 0.14;
  const inventoryFactor = clamp(0.95 + Math.log1p(meta.days) / 22, 0.98, 1.16);
  const demandFactor = seasonalFactor * trendFactor;

  const totalItems = Math.max(
    1,
    Math.round(
      product.baseItems *
        inventoryFactor *
        (0.97 + Math.abs(Math.cos(product.seed + meta.months)) * 0.07),
    ),
  );

  const totalViews = Math.max(
    1,
    Math.round(product.monthlyViews * meta.months * demandFactor),
  );

  const rawBookings =
    product.monthlyBookings *
    meta.months *
    seasonalFactor *
    bookingFactor *
    (0.94 + (inventoryFactor - 1) * 0.25);

  const bookings = Math.max(
    0,
    Math.min(Math.round(rawBookings), Math.round(totalViews * 0.18)),
  );

  const boostedItems = clamp(
    Math.round(
      totalItems *
        product.boostRate *
        (0.94 +
          Math.abs(Math.sin(meta.timeToken * 0.19 + product.seed)) * 0.12),
    ),
    0,
    totalItems,
  );

  const leadTimeDays = round1(
    product.baseLeadTimeDays *
      (0.94 +
        seasonalFactor * 0.08 +
        Math.abs(Math.cos(product.seed + meta.months)) * 0.05),
  );

  const avgRentalDuration = round1(
    product.baseRentalDuration *
      (0.96 +
        seasonalFactor * 0.05 +
        Math.abs(Math.sin(product.seed + meta.days / 45)) * 0.04),
  );

  const availabilityRate = clamp(
    product.baseAvailability -
      (demandFactor - 1) * 0.08 +
      Math.sin(product.seed + meta.days * 0.05) * 0.01,
    0.38,
    0.93,
  );

  const reviews = Math.max(
    0,
    Math.round(
      bookings *
        product.reviewRate *
        (0.94 +
          Math.abs(Math.cos(meta.timeToken * 0.11 + product.seed)) * 0.1),
    ),
  );

  const avgRating = round2(
    clamp(
      product.baseRating +
        Math.sin(meta.timeToken * 0.13 + product.seed) * 0.08,
      3.9,
      5,
    ),
  );

  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    subCategoryId: product.subCategoryId,
    subCategoryName: product.subCategoryName,
    totalItems,
    boostedItems,
    bookings,
    revenue: Math.round(bookings * product.dailyRate * avgRentalDuration),
    leadTimeDays,
    totalViews,
    avgViews: round1(totalViews / totalItems),
    conversionRate: totalViews ? bookings / totalViews : 0,
    boostedRate: totalItems ? boostedItems / totalItems : 0,
    avgRentalDuration,
    availabilityRate: round2(availabilityRate),
    avgRating,
    reviews,
  };
}

function finalizeAggregate(entry) {
  const ratingBase = entry.__ratingBase || 1;
  const bookingsBase = entry.bookings || 1;
  const itemsBase = entry.totalItems || 1;

  return {
    ...entry,
    leadTimeDays: round1(entry.__leadTimeWeight / bookingsBase),
    conversionRate: entry.totalViews ? entry.bookings / entry.totalViews : 0,
    boostedRate: entry.totalItems ? entry.boostedItems / entry.totalItems : 0,
    avgRentalDuration: round1(entry.__rentalDurationWeight / bookingsBase),
    availabilityRate: round2(entry.__availabilityWeight / itemsBase),
    avgRating: round2(entry.__ratingWeight / ratingBase),
  };
}

function aggregateProducts(rows, mode) {
  const map = new Map();

  rows.forEach((row) => {
    const key = mode === "category" ? row.categoryId : row.subCategoryId;
    const name = mode === "category" ? row.categoryName : row.subCategoryName;

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name,
        totalItems: 0,
        boostedItems: 0,
        bookings: 0,
        revenue: 0,
        totalViews: 0,
        reviews: 0,
        __leadTimeWeight: 0,
        __rentalDurationWeight: 0,
        __availabilityWeight: 0,
        __ratingWeight: 0,
        __ratingBase: 0,
      });
    }

    const entry = map.get(key);
    entry.totalItems += row.totalItems;
    entry.boostedItems += row.boostedItems;
    entry.bookings += row.bookings;
    entry.revenue += row.revenue;
    entry.totalViews += row.totalViews;
    entry.reviews += row.reviews;
    entry.__leadTimeWeight += row.leadTimeDays * row.bookings;
    entry.__rentalDurationWeight += row.avgRentalDuration * row.bookings;
    entry.__availabilityWeight += row.availabilityRate * row.totalItems;
    entry.__ratingWeight += row.avgRating * Math.max(row.reviews, 1);
    entry.__ratingBase += Math.max(row.reviews, 1);
  });

  return Array.from(map.values())
    .map(finalizeAggregate)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildSummary(products, categories, subCategories) {
  return {
    categories: categories.length,
    subCategories: subCategories.length,
    productTypes: products.length,
    totalItems: products.reduce((sum, row) => sum + row.totalItems, 0),
    boostedItems: products.reduce((sum, row) => sum + row.boostedItems, 0),
    bookings: products.reduce((sum, row) => sum + row.bookings, 0),
    revenue: products.reduce((sum, row) => sum + row.revenue, 0),
  };
}

export async function getCategoriesProductsAnalytics(start, end) {
  await sleep();

  const meta = getRangeMeta(start, end);
  const products = PRODUCT_CATALOG.map((product) => buildProductRow(product, meta))
    .sort((a, b) => a.name.localeCompare(b.name));
  const categories = aggregateProducts(products, "category");
  const subCategories = aggregateProducts(products, "subCategory");

  return {
    categories,
    subCategories,
    products,
    summary: buildSummary(products, categories, subCategories),
  };
}

export default {
  getCategoriesProductsAnalytics,
};
