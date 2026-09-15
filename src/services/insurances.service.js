const LS_INSURANCE_PLANS = "zip_insurance_plans_v1";
const LS_INSURANCE_OVERRIDES = "zip_insurance_overrides_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const CATEGORY_OPTIONS = [
  { id: "cat_outdoors", name: "Outdoors & Nature" },
  { id: "cat_tools", name: "Tools & DIY" },
  { id: "cat_electronics", name: "Electronics & Media" },
  { id: "cat_home", name: "Home & Events" },
];

const SUB_CATEGORY_OPTIONS = [
  { id: "sub_camping", categoryId: "cat_outdoors", name: "Camping" },
  { id: "sub_water_sports", categoryId: "cat_outdoors", name: "Water Sports" },
  { id: "sub_power_tools", categoryId: "cat_tools", name: "Power Tools" },
  {
    id: "sub_garden_equipment",
    categoryId: "cat_tools",
    name: "Garden Equipment",
  },
  {
    id: "sub_cameras",
    categoryId: "cat_electronics",
    name: "Cameras & Photography",
  },
  { id: "sub_event_tech", categoryId: "cat_electronics", name: "Event Tech" },
  {
    id: "sub_event_essentials",
    categoryId: "cat_home",
    name: "Event Essentials",
  },
  {
    id: "sub_kitchen_appliances",
    categoryId: "cat_home",
    name: "Kitchen Appliances",
  },
];

const ITEM_OPTIONS = [
  {
    id: "item_high_value_tent",
    subCategoryId: "sub_camping",
    name: "High-value tent",
    productName: "Tent",
  },
  {
    id: "item_family_bundle",
    subCategoryId: "sub_camping",
    name: "Family camping bundle",
    productName: "Tent",
  },
  {
    id: "item_kayak_expedition",
    subCategoryId: "sub_water_sports",
    name: "Kayak expedition kit",
    productName: "Kayak",
  },
  {
    id: "item_camera_pro_kit",
    subCategoryId: "sub_cameras",
    name: "Pro camera kit",
    productName: "DSLR camera",
  },
  {
    id: "item_4k_projector",
    subCategoryId: "sub_event_tech",
    name: "4K projector pro",
    productName: "Projector",
  },
  {
    id: "item_speaker_system_xl",
    subCategoryId: "sub_event_tech",
    name: "Speaker system XL",
    productName: "Speaker system",
  },
  {
    id: "item_pressure_washer_max",
    subCategoryId: "sub_power_tools",
    name: "Pressure washer max",
    productName: "Pressure washer",
  },
  {
    id: "item_espresso_lux",
    subCategoryId: "sub_kitchen_appliances",
    name: "Luxury espresso machine",
    productName: "Espresso machine",
  },
];

const ITEM_USAGE_CATALOG = [
  {
    itemId: "item_high_value_tent",
    annualBookings: 860,
    insuredRate: 0.82,
    avgRentalPrice: 118,
    avgDays: 4.4,
    seasonalPeakMonth: 6,
    seasonalAmplitude: 0.12,
    demandBias: 1.08,
    seed: 0.31,
  },
  {
    itemId: "item_family_bundle",
    annualBookings: 740,
    insuredRate: 0.64,
    avgRentalPrice: 86,
    avgDays: 3.8,
    seasonalPeakMonth: 6,
    seasonalAmplitude: 0.1,
    demandBias: 1.02,
    seed: 0.67,
  },
  {
    itemId: "item_kayak_expedition",
    annualBookings: 510,
    insuredRate: 0.73,
    avgRentalPrice: 92,
    avgDays: 2.6,
    seasonalPeakMonth: 7,
    seasonalAmplitude: 0.13,
    demandBias: 1.11,
    seed: 1.04,
  },
  {
    itemId: "item_camera_pro_kit",
    annualBookings: 620,
    insuredRate: 0.77,
    avgRentalPrice: 124,
    avgDays: 2.3,
    seasonalPeakMonth: 10,
    seasonalAmplitude: 0.09,
    demandBias: 1.06,
    seed: 1.39,
  },
  {
    itemId: "item_4k_projector",
    annualBookings: 470,
    insuredRate: 0.68,
    avgRentalPrice: 136,
    avgDays: 2.1,
    seasonalPeakMonth: 11,
    seasonalAmplitude: 0.08,
    demandBias: 1.03,
    seed: 1.78,
  },
  {
    itemId: "item_speaker_system_xl",
    annualBookings: 540,
    insuredRate: 0.61,
    avgRentalPrice: 144,
    avgDays: 2.4,
    seasonalPeakMonth: 11,
    seasonalAmplitude: 0.08,
    demandBias: 1.01,
    seed: 2.06,
  },
  {
    itemId: "item_pressure_washer_max",
    annualBookings: 430,
    insuredRate: 0.58,
    avgRentalPrice: 74,
    avgDays: 1.8,
    seasonalPeakMonth: 4,
    seasonalAmplitude: 0.09,
    demandBias: 0.96,
    seed: 2.37,
  },
  {
    itemId: "item_espresso_lux",
    annualBookings: 310,
    insuredRate: 0.55,
    avgRentalPrice: 88,
    avgDays: 2,
    seasonalPeakMonth: 12,
    seasonalAmplitude: 0.07,
    demandBias: 0.94,
    seed: 2.71,
  },
];

function sleep(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toDate(value, fallback) {
  const next = value instanceof Date ? new Date(value) : new Date(value || fallback);
  if (Number.isNaN(next.getTime())) return new Date(fallback);
  return next;
}

function uniqueValidIds(ids, validIds) {
  const validSet = new Set(validIds);
  return [...new Set((ids || []).filter((id) => validSet.has(id)))];
}

function sanitizePlan(input) {
  return {
    name: String(input?.name || "").trim(),
    description: String(input?.description || "").trim(),
    pricingType: ["percentage", "fixed_amount", "fixed_amount_per_day"].includes(
      input?.pricingType,
    )
      ? input.pricingType
      : "percentage",
    priceValue: round2(Math.max(0, Number(input?.priceValue || 0))),
    categoryIds: uniqueValidIds(
      input?.categoryIds,
      CATEGORY_OPTIONS.map((item) => item.id),
    ),
    subCategoryIds: uniqueValidIds(
      input?.subCategoryIds,
      SUB_CATEGORY_OPTIONS.map((item) => item.id),
    ),
  };
}

function sanitizeOverride(input, validPlanIds) {
  return {
    itemId: uniqueValidIds(
      [input?.itemId],
      ITEM_OPTIONS.map((item) => item.id),
    )[0] || "",
    planIds: uniqueValidIds(input?.planIds, validPlanIds),
  };
}

function buildMaps() {
  const categoryById = new Map(CATEGORY_OPTIONS.map((item) => [item.id, item]));
  const subCategoryById = new Map(
    SUB_CATEGORY_OPTIONS.map((item) => [item.id, item]),
  );
  const itemById = new Map(ITEM_OPTIONS.map((item) => [item.id, item]));
  return { categoryById, subCategoryById, itemById };
}

function seed() {
  if (!read(LS_INSURANCE_PLANS, null)) {
    write(LS_INSURANCE_PLANS, [
      {
        id: "plan_basic",
        name: "Basic Protection",
        description: "Covers common accidental damage on standard rentals.",
        pricingType: "percentage",
        priceValue: 10,
        categoryIds: ["cat_outdoors", "cat_tools"],
        subCategoryIds: ["sub_event_tech"],
      },
      {
        id: "plan_plus",
        name: "Rental Care",
        description: "Adds a fixed booking fee for theft, loss, and breakage.",
        pricingType: "fixed_amount",
        priceValue: 4.99,
        categoryIds: ["cat_home", "cat_electronics"],
        subCategoryIds: ["sub_camping", "sub_cameras"],
      },
      {
        id: "plan_premium",
        name: "Premium Cover",
        description: "Premium daily coverage for high-value and travel-heavy items.",
        pricingType: "fixed_amount_per_day",
        priceValue: 1.5,
        categoryIds: ["cat_outdoors"],
        subCategoryIds: ["sub_water_sports", "sub_cameras"],
      },
    ]);
  }

  if (!read(LS_INSURANCE_OVERRIDES, null)) {
    write(LS_INSURANCE_OVERRIDES, [
      {
        id: "ovr_tent",
        itemId: "item_high_value_tent",
        planIds: ["plan_basic"],
      },
      {
        id: "ovr_projector",
        itemId: "item_4k_projector",
        planIds: ["plan_plus", "plan_premium"],
      },
    ]);
  }
}

function listPlansRaw() {
  seed();
  return (read(LS_INSURANCE_PLANS, []) || []).map((plan) => ({
    id: plan.id,
    ...sanitizePlan(plan),
  }));
}

function listOverridesRaw() {
  seed();
  const planIds = listPlansRaw().map((plan) => plan.id);
  return (read(LS_INSURANCE_OVERRIDES, []) || [])
    .map((row) => ({
      id: row.id,
      ...sanitizeOverride(row, planIds),
    }))
    .filter((row) => row.itemId);
}

function getInheritedPlanIdsForItem(itemId, plans) {
  const { itemById, subCategoryById } = buildMaps();
  const item = itemById.get(itemId);
  if (!item) return [];

  const subCategory = subCategoryById.get(item.subCategoryId);
  const categoryId = subCategory?.categoryId;

  return plans
    .filter(
      (plan) =>
        plan.subCategoryIds.includes(item.subCategoryId) ||
        (categoryId && plan.categoryIds.includes(categoryId)),
    )
    .map((plan) => plan.id);
}

function getResolvedPlanIdsForItem(itemId, plans, overrides) {
  const override = overrides.find((row) => row.itemId === itemId);
  if (override) return override.planIds;
  return getInheritedPlanIdsForItem(itemId, plans);
}

function formatPricing(plan) {
  if (plan.pricingType === "percentage") {
    return `${round2(plan.priceValue)}% of rental price`;
  }
  if (plan.pricingType === "fixed_amount_per_day") {
    return `$${round2(plan.priceValue).toFixed(2)} / day`;
  }
  return `$${round2(plan.priceValue).toFixed(2)} fixed`;
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
  const midpoint = new Date(
    safeStart.getTime() + (safeEnd.getTime() - safeStart.getTime()) / 2,
  );

  return {
    days,
    months: days / 30,
    midpoint,
    timeToken: midpoint.getFullYear() * 12 + midpoint.getMonth() + 1,
  };
}

function getCoverageFactor(days) {
  return clamp(Math.pow(days / 365, 0.57), 0.12, 1.08);
}

function getSeasonalFactor(itemUsage, meta) {
  const month = meta.midpoint.getMonth();
  const angle = ((month - itemUsage.seasonalPeakMonth) / 12) * Math.PI * 2;
  return 1 + Math.cos(angle) * itemUsage.seasonalAmplitude;
}

function getPlanAppeal(plan, itemUsage, meta) {
  const typeBoost =
    plan.pricingType === "percentage"
      ? 1.04
      : plan.pricingType === "fixed_amount"
        ? 1
        : 0.95;
  const pricePenalty =
    plan.pricingType === "percentage"
      ? plan.priceValue / 30
      : plan.pricingType === "fixed_amount_per_day"
        ? plan.priceValue / 5
        : plan.priceValue / 12;

  return clamp(
    typeBoost -
      pricePenalty * 0.06 +
      Math.sin(meta.timeToken * 0.14 + itemUsage.seed + pricePenalty) * 0.05,
    0.2,
    1.4,
  );
}

function getFeeForPlan(plan, itemUsage) {
  if (plan.pricingType === "percentage") {
    return (itemUsage.avgRentalPrice * plan.priceValue) / 100;
  }
  if (plan.pricingType === "fixed_amount_per_day") {
    return itemUsage.avgDays * plan.priceValue;
  }
  return plan.priceValue;
}

function buildUsageRows(plans, overrides, meta) {
  const { itemById, subCategoryById, categoryById } = buildMaps();

  return ITEM_USAGE_CATALOG.map((itemUsage) => {
    const itemMeta = itemById.get(itemUsage.itemId);
    const subCategory = subCategoryById.get(itemMeta.subCategoryId);
    const category = categoryById.get(subCategory.categoryId);
    const availablePlanIds = getResolvedPlanIdsForItem(itemUsage.itemId, plans, overrides);
    const availablePlans = availablePlanIds
      .map((planId) => plans.find((plan) => plan.id === planId))
      .filter(Boolean);

    const coverageFactor = getCoverageFactor(meta.days);
    const seasonalFactor = getSeasonalFactor(itemUsage, meta);
    const demandFactor =
      0.94 +
      Math.sin(meta.timeToken * 0.16 + itemUsage.seed) * 0.06 +
      (itemUsage.demandBias - 1) * 0.14;

    const totalBookings = Math.max(
      1,
      Math.round(
        itemUsage.annualBookings * coverageFactor * seasonalFactor * demandFactor,
      ),
    );

    const insuredBookings = availablePlans.length
      ? Math.round(
          totalBookings *
            clamp(
              itemUsage.insuredRate *
                (0.95 +
                  seasonalFactor * 0.05 +
                  Math.cos(meta.timeToken * 0.09 + itemUsage.seed) * 0.04),
              0.08,
              0.94,
            ),
        )
      : 0;

    const breakdown = [];
    let insuranceRevenue = 0;

    if (insuredBookings > 0 && availablePlans.length > 0) {
      const weightedPlans = availablePlans.map((plan) => ({
        plan,
        weight: getPlanAppeal(plan, itemUsage, meta),
      }));
      const totalWeight =
        weightedPlans.reduce((sum, row) => sum + row.weight, 0) || 1;
      let remainingBookings = insuredBookings;

      weightedPlans.forEach((row, index) => {
        const planBookings =
          index === weightedPlans.length - 1
            ? remainingBookings
            : Math.round((insuredBookings * row.weight) / totalWeight);
        remainingBookings -= planBookings;

        const fee = getFeeForPlan(row.plan, itemUsage);
        insuranceRevenue += planBookings * fee;
        breakdown.push({
          planId: row.plan.id,
          bookings: planBookings,
          revenue: planBookings * fee,
        });
      });
    }

    return {
      id: itemUsage.itemId,
      categoryId: category.id,
      categoryName: category.name,
      subCategoryId: subCategory.id,
      subCategoryName: subCategory.name,
      productName: itemMeta.productName,
      itemName: itemMeta.name,
      totalBookings,
      insuredBookings,
      uninsuredBookings: Math.max(0, totalBookings - insuredBookings),
      usageRate: totalBookings ? insuredBookings / totalBookings : 0,
      insuranceRevenue: round2(insuranceRevenue),
      breakdown,
    };
  });
}

function aggregateUsage(rows, key, labelKey) {
  const map = new Map();

  rows.forEach((row) => {
    const id = row[key];
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: row[labelKey],
        totalBookings: 0,
        insuredBookings: 0,
        insuranceRevenue: 0,
      });
    }

    const entry = map.get(id);
    entry.totalBookings += row.totalBookings;
    entry.insuredBookings += row.insuredBookings;
    entry.insuranceRevenue += row.insuranceRevenue;
  });

  return Array.from(map.values()).map((entry) => ({
    ...entry,
    usageRate: entry.totalBookings ? entry.insuredBookings / entry.totalBookings : 0,
    insuranceRevenue: round2(entry.insuranceRevenue),
  }));
}

function aggregatePlans(rows, plans) {
  const map = new Map(
    plans.map((plan) => [
      plan.id,
      {
        id: plan.id,
        name: plan.name,
        pricing: formatPricing(plan),
        bookings: 0,
        revenue: 0,
      },
    ]),
  );

  rows.forEach((row) => {
    row.breakdown.forEach((item) => {
      if (!map.has(item.planId)) return;
      const entry = map.get(item.planId);
      entry.bookings += item.bookings;
      entry.revenue += item.revenue;
    });
  });

  return Array.from(map.values()).map((entry) => ({
    ...entry,
    revenue: round2(entry.revenue),
  }));
}

export async function listInsurancePlans() {
  await sleep();
  return listPlansRaw();
}

export async function createInsurancePlan(payload) {
  await sleep();
  const next = sanitizePlan(payload);
  const all = listPlansRaw();
  const item = { id: uid("plan"), ...next };
  write(LS_INSURANCE_PLANS, [item, ...all]);
  return item;
}

export async function updateInsurancePlan(id, payload) {
  await sleep();
  const all = listPlansRaw();
  const index = all.findIndex((plan) => plan.id === id);
  if (index === -1) throw new Error("Insurance plan not found.");
  all[index] = { ...all[index], ...sanitizePlan(payload) };
  write(LS_INSURANCE_PLANS, all);
  return all[index];
}

export async function removeInsurancePlan(id) {
  await sleep();
  const nextPlans = listPlansRaw().filter((plan) => plan.id !== id);
  write(LS_INSURANCE_PLANS, nextPlans);

  const nextOverrides = listOverridesRaw()
    .map((row) => ({
      ...row,
      planIds: row.planIds.filter((planId) => planId !== id),
    }))
    .filter((row) => row.planIds.length > 0);
  write(LS_INSURANCE_OVERRIDES, nextOverrides);

  return { ok: true };
}

export async function listInsuranceOverrides() {
  await sleep();
  const plans = listPlansRaw();
  const overrides = listOverridesRaw();
  const { itemById, subCategoryById, categoryById } = buildMaps();

  return overrides.map((row) => {
    const item = itemById.get(row.itemId);
    const subCategory = subCategoryById.get(item.subCategoryId);
    const category = categoryById.get(subCategory.categoryId);
    const inheritedPlanIds = getInheritedPlanIdsForItem(row.itemId, plans);

    return {
      ...row,
      itemName: item.name,
      productName: item.productName,
      categoryName: category.name,
      subCategoryName: subCategory.name,
      inheritedPlans: inheritedPlanIds
        .map((planId) => plans.find((plan) => plan.id === planId)?.name)
        .filter(Boolean)
        .join(", "),
      appliedPlans: row.planIds
        .map((planId) => plans.find((plan) => plan.id === planId)?.name)
        .filter(Boolean)
        .join(", "),
    };
  });
}

export async function createInsuranceOverride(payload) {
  await sleep();
  const plans = listPlansRaw();
  const next = sanitizeOverride(payload, plans.map((plan) => plan.id));
  if (!next.itemId) throw new Error("A specific item is required.");

  const all = listOverridesRaw();
  const existing = all.find((row) => row.itemId === next.itemId);
  if (existing) {
    throw new Error("This item already has an override. Edit it instead.");
  }

  const item = { id: uid("ovr"), ...next };
  write(LS_INSURANCE_OVERRIDES, [item, ...all]);
  return item;
}

export async function updateInsuranceOverride(id, payload) {
  await sleep();
  const plans = listPlansRaw();
  const next = sanitizeOverride(payload, plans.map((plan) => plan.id));
  const all = listOverridesRaw();
  const index = all.findIndex((row) => row.id === id);
  if (index === -1) throw new Error("Insurance override not found.");

  const duplicate = all.find((row) => row.itemId === next.itemId && row.id !== id);
  if (duplicate) {
    throw new Error("This item already has another override.");
  }

  all[index] = { ...all[index], ...next };
  write(LS_INSURANCE_OVERRIDES, all);
  return all[index];
}

export async function removeInsuranceOverride(id) {
  await sleep();
  write(
    LS_INSURANCE_OVERRIDES,
    listOverridesRaw().filter((row) => row.id !== id),
  );
  return { ok: true };
}

export async function getInsuranceAssignmentOptions() {
  await sleep();
  const { categoryById, subCategoryById } = buildMaps();

  return {
    categories: CATEGORY_OPTIONS,
    subCategories: SUB_CATEGORY_OPTIONS.map((item) => ({
      ...item,
      categoryName: categoryById.get(item.categoryId)?.name || "-",
    })),
    items: ITEM_OPTIONS.map((item) => {
      const subCategory = subCategoryById.get(item.subCategoryId);
      return {
        ...item,
        subCategoryName: subCategory?.name || "-",
        categoryName: categoryById.get(subCategory?.categoryId)?.name || "-",
      };
    }),
  };
}

export async function getInsuranceDashboard(start, end) {
  await sleep();

  const plans = listPlansRaw();
  const overrides = listOverridesRaw();
  const meta = getRangeMeta(start, end);
  const itemUsageRows = buildUsageRows(plans, overrides, meta);

  const totalBookings = itemUsageRows.reduce(
    (sum, row) => sum + row.totalBookings,
    0,
  );
  const insuredBookings = itemUsageRows.reduce(
    (sum, row) => sum + row.insuredBookings,
    0,
  );
  const insuranceRevenue = itemUsageRows.reduce(
    (sum, row) => sum + row.insuranceRevenue,
    0,
  );

  return {
    metrics: {
      totalBookings,
      insuredBookings,
      uninsuredBookings: Math.max(0, totalBookings - insuredBookings),
      insuredPct: totalBookings ? insuredBookings / totalBookings : 0,
      uninsuredPct: totalBookings
        ? (totalBookings - insuredBookings) / totalBookings
        : 0,
      totalInsuranceRevenue: round2(insuranceRevenue),
    },
    categoryUsage: aggregateUsage(itemUsageRows, "categoryId", "categoryName"),
    subCategoryUsage: aggregateUsage(
      itemUsageRows,
      "subCategoryId",
      "subCategoryName",
    ),
    productUsage: aggregateUsage(itemUsageRows, "productName", "productName"),
    planUsage: aggregatePlans(itemUsageRows, plans),
  };
}

export default {
  listInsurancePlans,
  createInsurancePlan,
  updateInsurancePlan,
  removeInsurancePlan,
  listInsuranceOverrides,
  createInsuranceOverride,
  updateInsuranceOverride,
  removeInsuranceOverride,
  getInsuranceAssignmentOptions,
  getInsuranceDashboard,
};
