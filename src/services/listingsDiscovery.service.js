import { api } from "./apiClient.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function buildEmptySeries(key, _start, _end) {
  const fallbackEnd = new Date();
  const fallbackStart = new Date(fallbackEnd.getTime() - 6 * DAY_MS);
  const startMs = _start ? new Date(_start).getTime() : fallbackStart.getTime();
  const endMs = _end ? new Date(_end).getTime() : fallbackEnd.getTime();
  const days = Math.max(1, Math.round((endMs - startMs) / DAY_MS) + 1);
  return Array.from({ length: Math.min(days, 7) }, (_, i) => {
    const d = new Date(startMs + i * DAY_MS);
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      [key]: 0,
      totalListings: 0,
    };
  });
}

export async function getTotalListingsSeries(_start, _end) { return buildEmptySeries("totalListings", _start, _end); }
export async function getActiveListingsSeries(_start, _end) { return buildEmptySeries("activeListings", _start, _end); }
export async function getAvgViewsPerListingSeries(_start, _end) { return buildEmptySeries("avgViews", _start, _end); }
export async function getAvgViewsBoostedSeries(_start, _end) { return buildEmptySeries("avgViewsBoosted", _start, _end); }
export async function getAvgViewsNonBoostedSeries(_start, _end) { return buildEmptySeries("avgViewsNonBoosted", _start, _end); }
export async function getBoostedVsNonBoostedSeries(_start, _end) { return buildEmptySeries("boosted", _start, _end); }
export async function getNumberOfBoostedSeries(_start, _end) { return buildEmptySeries("boostedCount", _start, _end); }

export async function getListingsMetrics(_start, _end) {
  const res = await api.get("/admin/stats");
  const items = res.data?.items ?? {};
  return { total: items.total ?? 0, active: items.active ?? 0, boosted: 0, avgViews: 0 };
}

function normalizeListing(item) {
  const owner = typeof item.owner === "object" ? item.owner : {};
  return {
    id: item._id,
    title: item.title ?? "—",
    category: item.category ?? "other",
    categoryId: item.category ?? "other",
    owner: `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() || "—",
    city: item.location?.city ?? "—",
    featured: item.isFeatured ?? false,
    status: item.isActive ? (item.isPaused || !item.availability?.isAvailable ? "Paused" : "Active") : "Paused",
    dailyRate: item.dailyRate ?? 0,
    photos: item.photos ?? [],
    createdAt: item.createdAt,
  };
}

export function normalizeListingStatus(status) {
  if (status === "Pending") return "Paused";
  return status || "Active";
}

export async function listListings({ q = "", status = "all", categoryId = "all", page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", Math.min(pageSize, 50));
  if (q) params.set("search", q);
  if (categoryId && categoryId !== "all") params.set("category", categoryId);
  if (status !== "all") params.set("isActive", status === "Active" ? "true" : "false");

  const res = await api.get(`/admin/items?${params.toString()}`);
  const rows = (res.data || []).map(normalizeListing);
  const total = res.pagination?.total ?? rows.length;
  return { rows, total };
}

export async function createListing(_payload) {
  throw new Error("Creating listings from admin panel is not supported.");
}

export async function updateListing(id, patch) {
  if (patch.featured === true) {
    await api.put(`/admin/items/${id}/feature`, {});
  } else if (patch.featured === false || patch.status === "Paused" || patch.status === "Pending") {
    await api.put(`/admin/items/${id}/deactivate`, {});
  }
  return { id, ...patch };
}

export async function removeListing(id) {
  await api.put(`/admin/items/${id}/deactivate`);
  return { ok: true };
}

export async function listCategories() {
  const res = await api.get("/eco/categories");
  return (res.data || []).map((c) => ({
    id: c.category,
    name: c.category.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
  }));
}

export async function saveCategories(next) { return next; }
export async function createCategory(_name) { throw new Error("Categories are managed via API configuration."); }
export async function updateCategory(id, _patch) { return { id }; }
export async function removeCategory(_id) { return { ok: true }; }

export async function getDiscoverySettings() { return { featuredLimit: 12, showFeatured: true }; }
export async function saveDiscoverySettings(_next) { return _next; }

export async function getCarbonConfig() {
  const res = await api.get("/eco/categories");
  const mappings = (res.data || []).map((c) => ({
    id: c.category,
    category: c.category,
    co2PerDay: parseFloat((c.co2SavedKg / 30).toFixed(2)),
  }));
  return { source: "Sequoia API", mappings };
}
export async function saveCarbonConfig(_next) { return _next; }

export async function getSustainabilityConfig() {
  return { mappingEnabled: true, source: "Sequoia API", description: "CO2 savings calculated from item category footprint" };
}
export async function saveSustainabilityConfig(_next) { return _next; }

export async function listCarbonMappings() {
  const res = await api.get("/eco/categories");
  return (res.data || []).map((c) => ({
    id: c.category,
    category: c.category,
    categoryName: c.category.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    co2PerDay: parseFloat((c.co2SavedKg / 30).toFixed(2)),
    co2SavedKg: c.co2SavedKg,
    kmEquivalent: c.kmEquivalent,
  }));
}
export async function upsertCarbonMapping(_payload) { return _payload; }
export async function removeCarbonMapping(_id) { return { ok: true }; }

export default {
  getTotalListingsSeries, getActiveListingsSeries, getAvgViewsPerListingSeries,
  getAvgViewsBoostedSeries, getAvgViewsNonBoostedSeries, getBoostedVsNonBoostedSeries,
  getNumberOfBoostedSeries, getListingsMetrics,
};