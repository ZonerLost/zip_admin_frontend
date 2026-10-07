const DAY_MS = 24 * 60 * 60 * 1000;

const CITY_CATALOG = [
  {
    id: "city_denver",
    name: "Denver",
    region: "Colorado, USA",
    population: 716577,
    annualUsers: 24800,
    annualListings: 8350,
    annualBookings: 38400,
    activeRate: 0.62,
    co2PerBookingKg: 4.8,
    seasonalPeakMonth: 6,
    growthBias: 0.08,
    sustainabilityBias: 1.12,
    seed: 0.31,
    categories: [
      ["Outdoors & Nature", 1.42],
      ["Tools & DIY", 1.08],
      ["Electronics & Media", 0.86],
      ["Home & Events", 0.74],
    ],
    subCategories: [
      ["Camping", 1.4],
      ["Water Sports", 1.11],
      ["Power Tools", 0.91],
      ["Cameras & Photography", 0.84],
    ],
    products: [
      ["Tent", 1.46],
      ["Kayak", 1.22],
      ["Sleeping bag", 1.14],
      ["DSLR camera", 0.88],
    ],
  },
  {
    id: "city_portland",
    name: "Portland",
    region: "Oregon, USA",
    population: 630498,
    annualUsers: 21400,
    annualListings: 7420,
    annualBookings: 31200,
    activeRate: 0.59,
    co2PerBookingKg: 4.5,
    seasonalPeakMonth: 6,
    growthBias: 0.07,
    sustainabilityBias: 1.09,
    seed: 0.67,
    categories: [
      ["Outdoors & Nature", 1.36],
      ["Home & Events", 1.03],
      ["Tools & DIY", 0.97],
      ["Electronics & Media", 0.82],
    ],
    subCategories: [
      ["Camping", 1.3],
      ["Garden Equipment", 1.08],
      ["Kitchen Appliances", 0.89],
      ["Cameras & Photography", 0.81],
    ],
    products: [
      ["Tent", 1.31],
      ["Lawn mower", 1.09],
      ["Espresso machine", 0.92],
      ["Projector", 0.84],
    ],
  },
  {
    id: "city_austin",
    name: "Austin",
    region: "Texas, USA",
    population: 979882,
    annualUsers: 36200,
    annualListings: 12100,
    annualBookings: 50700,
    activeRate: 0.64,
    co2PerBookingKg: 4.2,
    seasonalPeakMonth: 4,
    growthBias: 0.11,
    sustainabilityBias: 1.04,
    seed: 1.01,
    categories: [
      ["Home & Events", 1.28],
      ["Tools & DIY", 1.17],
      ["Electronics & Media", 1.06],
      ["Outdoors & Nature", 0.93],
    ],
    subCategories: [
      ["Event Tech", 1.24],
      ["Power Tools", 1.13],
      ["Event Essentials", 1.04],
      ["Water Sports", 0.82],
    ],
    products: [
      ["Speaker system", 1.29],
      ["Projector", 1.14],
      ["Power drill", 1.02],
      ["Folding chair", 0.9],
    ],
  },
  {
    id: "city_seattle",
    name: "Seattle",
    region: "Washington, USA",
    population: 755078,
    annualUsers: 27100,
    annualListings: 8870,
    annualBookings: 36700,
    activeRate: 0.6,
    co2PerBookingKg: 4.9,
    seasonalPeakMonth: 7,
    growthBias: 0.09,
    sustainabilityBias: 1.1,
    seed: 1.39,
    categories: [
      ["Electronics & Media", 1.29],
      ["Outdoors & Nature", 1.18],
      ["Home & Events", 0.91],
      ["Tools & DIY", 0.88],
    ],
    subCategories: [
      ["Cameras & Photography", 1.26],
      ["Camping", 1.11],
      ["Event Tech", 0.95],
      ["Kitchen Appliances", 0.77],
    ],
    products: [
      ["DSLR camera", 1.31],
      ["Action camera", 1.17],
      ["Tent", 1.02],
      ["Projector", 0.82],
    ],
  },
  {
    id: "city_san_francisco",
    name: "San Francisco",
    region: "California, USA",
    population: 808988,
    annualUsers: 33800,
    annualListings: 9320,
    annualBookings: 40100,
    activeRate: 0.63,
    co2PerBookingKg: 4.1,
    seasonalPeakMonth: 9,
    growthBias: 0.12,
    sustainabilityBias: 0.99,
    seed: 1.74,
    categories: [
      ["Electronics & Media", 1.41],
      ["Home & Events", 1.04],
      ["Outdoors & Nature", 0.92],
      ["Tools & DIY", 0.8],
    ],
    subCategories: [
      ["Cameras & Photography", 1.29],
      ["Event Tech", 1.18],
      ["Kitchen Appliances", 0.88],
      ["Camping", 0.69],
    ],
    products: [
      ["DSLR camera", 1.35],
      ["Projector", 1.16],
      ["Speaker system", 1.08],
      ["Espresso machine", 0.85],
    ],
  },
  {
    id: "city_toronto",
    name: "Toronto",
    region: "Ontario, Canada",
    population: 2794356,
    annualUsers: 41800,
    annualListings: 13800,
    annualBookings: 57300,
    activeRate: 0.57,
    co2PerBookingKg: 5.2,
    seasonalPeakMonth: 6,
    growthBias: 0.06,
    sustainabilityBias: 1.18,
    seed: 2.08,
    categories: [
      ["Home & Events", 1.21],
      ["Electronics & Media", 1.12],
      ["Tools & DIY", 0.98],
      ["Outdoors & Nature", 0.79],
    ],
    subCategories: [
      ["Event Essentials", 1.2],
      ["Event Tech", 1.09],
      ["Cameras & Photography", 0.97],
      ["Power Tools", 0.84],
    ],
    products: [
      ["Folding chair", 1.27],
      ["Event table", 1.12],
      ["Speaker system", 1.01],
      ["DSLR camera", 0.86],
    ],
  },
  {
    id: "city_vancouver",
    name: "Vancouver",
    region: "British Columbia, Canada",
    population: 662248,
    annualUsers: 23600,
    annualListings: 7810,
    annualBookings: 33600,
    activeRate: 0.61,
    co2PerBookingKg: 5.3,
    seasonalPeakMonth: 7,
    growthBias: 0.08,
    sustainabilityBias: 1.2,
    seed: 2.47,
    categories: [
      ["Outdoors & Nature", 1.44],
      ["Electronics & Media", 1.01],
      ["Home & Events", 0.85],
      ["Tools & DIY", 0.82],
    ],
    subCategories: [
      ["Water Sports", 1.31],
      ["Camping", 1.18],
      ["Cameras & Photography", 0.93],
      ["Event Essentials", 0.72],
    ],
    products: [
      ["Kayak", 1.34],
      ["Paddle board", 1.21],
      ["Tent", 1.08],
      ["Action camera", 0.88],
    ],
  },
  {
    id: "city_montreal",
    name: "Montreal",
    region: "Quebec, Canada",
    population: 1762949,
    annualUsers: 28600,
    annualListings: 10250,
    annualBookings: 38900,
    activeRate: 0.55,
    co2PerBookingKg: 5.1,
    seasonalPeakMonth: 5,
    growthBias: 0.05,
    sustainabilityBias: 1.16,
    seed: 2.83,
    categories: [
      ["Home & Events", 1.24],
      ["Electronics & Media", 1.07],
      ["Outdoors & Nature", 0.94],
      ["Tools & DIY", 0.73],
    ],
    subCategories: [
      ["Event Essentials", 1.18],
      ["Kitchen Appliances", 1.02],
      ["Cameras & Photography", 0.94],
      ["Camping", 0.76],
    ],
    products: [
      ["Folding chair", 1.19],
      ["Espresso machine", 1.05],
      ["Projector", 0.99],
      ["Event table", 0.91],
    ],
  },
  {
    id: "city_chicago",
    name: "Chicago",
    region: "Illinois, USA",
    population: 2664452,
    annualUsers: 39200,
    annualListings: 12900,
    annualBookings: 54800,
    activeRate: 0.56,
    co2PerBookingKg: 4.7,
    seasonalPeakMonth: 5,
    growthBias: 0.06,
    sustainabilityBias: 1.07,
    seed: 3.21,
    categories: [
      ["Tools & DIY", 1.14],
      ["Home & Events", 1.1],
      ["Electronics & Media", 1.02],
      ["Outdoors & Nature", 0.8],
    ],
    subCategories: [
      ["Power Tools", 1.12],
      ["Event Tech", 1.04],
      ["Event Essentials", 0.97],
      ["Garden Equipment", 0.88],
    ],
    products: [
      ["Power drill", 1.16],
      ["Pressure washer", 1.03],
      ["Projector", 0.96],
      ["Folding chair", 0.9],
    ],
  },
  {
    id: "city_miami",
    name: "Miami",
    region: "Florida, USA",
    population: 455924,
    annualUsers: 19800,
    annualListings: 6940,
    annualBookings: 30100,
    activeRate: 0.58,
    co2PerBookingKg: 3.9,
    seasonalPeakMonth: 2,
    growthBias: 0.1,
    sustainabilityBias: 0.96,
    seed: 3.64,
    categories: [
      ["Outdoors & Nature", 1.25],
      ["Home & Events", 1.16],
      ["Electronics & Media", 1.02],
      ["Tools & DIY", 0.69],
    ],
    subCategories: [
      ["Water Sports", 1.28],
      ["Event Essentials", 1.09],
      ["Event Tech", 1.01],
      ["Cameras & Photography", 0.82],
    ],
    products: [
      ["Paddle board", 1.25],
      ["Speaker system", 1.08],
      ["Event table", 1.02],
      ["Action camera", 0.88],
    ],
  },
];

function sleep(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function toDate(value, fallback) {
  const next = value instanceof Date ? new Date(value) : new Date(value || fallback);
  if (Number.isNaN(next.getTime())) return new Date(fallback);
  return next;
}

function buildRangeMeta(start, end) {
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
  const midpoint = new Date(
    safeStart.getTime() + (safeEnd.getTime() - safeStart.getTime()) / 2,
  );

  return {
    start: safeStart,
    end: safeEnd,
    days,
    months: days / 30,
    midpoint,
    timeToken: midpoint.getFullYear() * 12 + midpoint.getMonth() + 1,
  };
}

function shiftRangeMeta(meta, offsetDays) {
  return buildRangeMeta(
    new Date(meta.start.getTime() + offsetDays * DAY_MS),
    new Date(meta.end.getTime() + offsetDays * DAY_MS),
  );
}

function getCoverageFactor(days) {
  return clamp(Math.pow(days / 365, 0.58), 0.12, 1.08);
}

function getSeasonalFactor(city, meta) {
  const month = meta.midpoint.getMonth();
  const angle = ((month - city.seasonalPeakMonth) / 12) * Math.PI * 2;
  return 1 + Math.cos(angle) * 0.08;
}

function getTopThree(list, city, meta) {
  return [...list]
    .map(([name, weight], index) => ({
      name,
      score:
        weight *
        (1 +
          Math.sin(meta.timeToken * 0.13 + city.seed + index * 0.7) * 0.06 +
          Math.cos(meta.months * 0.8 + index) * 0.03),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.name)
    .join(", ");
}

function buildCityBase(city, meta) {
  const coverageFactor = getCoverageFactor(meta.days);
  const seasonalFactor = getSeasonalFactor(city, meta);
  const trendFactor =
    0.93 +
    city.growthBias +
    Math.sin(meta.timeToken * 0.17 + city.seed) * 0.07 +
    Math.cos(meta.months * 0.51 + city.seed) * 0.03;

  const totalUsers = Math.max(
    1,
    Math.round(city.annualUsers * coverageFactor * trendFactor),
  );
  const totalListings = Math.max(
    1,
    Math.round(city.annualListings * coverageFactor * seasonalFactor * trendFactor),
  );
  const totalBookings = Math.max(
    1,
    Math.round(
      city.annualBookings *
        coverageFactor *
        seasonalFactor *
        (trendFactor + 0.03),
    ),
  );
  const activeUsers = clamp(
    Math.round(
      totalUsers *
        (city.activeRate +
          Math.sin(meta.timeToken * 0.09 + city.seed) * 0.03),
    ),
    0,
    totalUsers,
  );

  return {
    totalUsers,
    usersPerCapita: totalUsers / city.population,
    totalListings,
    totalBookings,
    activeUsers,
    topCategories: getTopThree(city.categories, city, meta),
    topSubCategories: getTopThree(city.subCategories, city, meta),
    topProducts: getTopThree(city.products, city, meta),
  };
}

function growth(current, previous) {
  if (!previous) return 0;
  return (current - previous) / previous;
}

function buildCityRow(city, meta, previousMeta) {
  const current = buildCityBase(city, meta);
  const previous = buildCityBase(city, previousMeta);

  return {
    id: city.id,
    cityName: city.name,
    region: city.region,
    population: city.population,
    ...current,
    userGrowthPct: growth(current.totalUsers, previous.totalUsers),
    listingGrowthPct: growth(current.totalListings, previous.totalListings),
    bookingGrowthPct: growth(current.totalBookings, previous.totalBookings),
  };
}

function buildSummary(rows) {
  return {
    cities: rows.length,
    totalUsers: rows.reduce((sum, row) => sum + row.totalUsers, 0),
    totalBookings: rows.reduce((sum, row) => sum + row.totalBookings, 0),
    totalListings: rows.reduce((sum, row) => sum + row.totalListings, 0),
  };
}

export async function getCityDevelopmentGrowth(start, end) {
  await sleep();

  const meta = buildRangeMeta(start, end);
  const previousMeta = shiftRangeMeta(meta, -meta.days);
  const cities = CITY_CATALOG.map((city) =>
    buildCityRow(city, meta, previousMeta),
  ).sort((a, b) => a.cityName.localeCompare(b.cityName));

  return {
    cities,
    summary: buildSummary(cities),
  };
}

export default {
  getCityDevelopmentGrowth,
};
