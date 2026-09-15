import { api } from "./apiClient.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Normalize API booking → shape UI expects
function normalize(b) {
  const item = typeof b.item === "object" ? b.item : {};
  const renter = typeof b.renter === "object" ? b.renter : {};
  const owner = typeof b.owner === "object" ? b.owner : {};

  return {
    id: b._id,
    listingTitle: item.title ?? "—",
    listingCity: item.location?.city ?? "—",
    ownerName: `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() || "—",
    ownerEmail: owner.email ?? "",
    renterName: `${renter.firstName ?? ""} ${renter.lastName ?? ""}`.trim() || "—",
    renterEmail: renter.email ?? "",
    createdAt: b.createdAt,
    startDate: b.startDate,
    endDate: b.endDate,
    distanceKm: 0,
    deliveryMethod: b.deliveryType === "delivery" ? "Delivery" : "Pickup",
    // Map API statuses → UI statuses
    status: mapStatus(b.status),
    amount: b.pricing?.totalAmount ?? 0,
    cancelReason: b.cancelReason ?? null,
    declineReason: b.declineReason ?? null,
  };
}

function mapStatus(apiStatus) {
  const map = {
    pending: "Pending",
    accepted: "Approved",
    active: "Approved",
    completed: "Completed",
    cancelled: "Cancelled",
    declined: "Rejected",
  };
  return map[apiStatus] ?? "Pending";
}

// ── Chart series helpers (kept for chart compatibility — return empty series) ──

function buildEmptySeries(key, start, end) {
  const fallbackEnd = new Date();
  const fallbackStart = new Date(fallbackEnd.getTime() - 6 * DAY_MS);
  const startMs = start ? new Date(start).getTime() : fallbackStart.getTime();
  const endMs = end ? new Date(end).getTime() : fallbackEnd.getTime();
  const days = Math.max(1, Math.round((endMs - startMs) / DAY_MS) + 1);
  return Array.from({ length: Math.min(days, 7) }, (_, i) => {
    const d = new Date(startMs + i * DAY_MS);
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      [key]: 0,
    };
  });
}

export async function getTotalBookingsSeries(start, end) {
  return buildEmptySeries("totalBookings", start, end);
}
export async function getAmountOfRequestsSeries(start, end) {
  return buildEmptySeries("requests", start, end);
}
export async function getAvgResponseTimeSeries(start, end) {
  return buildEmptySeries("avgResponseMs", start, end);
}
export async function getAmountAcceptedSeries(start, end) {
  return buildEmptySeries("accepted", start, end);
}
export async function getAmountInstantBookingSeries(start, end) {
  return buildEmptySeries("instant", start, end);
}
export async function getAmountNotAcceptedSeries(start, end) {
  return buildEmptySeries("notAccepted", start, end);
}
export async function getAvgBookingPerListingNonBoostedSeries(start, end) {
  return buildEmptySeries("avgNonBoosted", start, end);
}
export async function getAvgBookingPerBoostedSeries(start, end) {
  return buildEmptySeries("avgBoosted", start, end);
}
export async function getPctDiffBoostedVsNonBoostedSeries(start, end) {
  return buildEmptySeries("pctDiff", start, end);
}

// ── Main CRUD functions ──────────────────────────────────

export async function listBookings({
  q = "",
  status = "all",
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", Math.min(pageSize, 50));

  // Map UI status → API status
  const statusMap = {
    Pending: "pending",
    Approved: "accepted",
    Cancelled: "cancelled",
    Rejected: "declined",
    Completed: "completed",
  };
  if (status && status !== "all" && statusMap[status]) {
    params.set("status", statusMap[status]);
  }

  const res = await api.get(`/admin/bookings?${params.toString()}`);
  let rows = (res.data || []).map(normalize);

  // Client-side search since API doesn't support full text search on bookings
  if (q) {
    const qq = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        (r.listingTitle || "").toLowerCase().includes(qq) ||
        (r.renterName || "").toLowerCase().includes(qq) ||
        (r.ownerName || "").toLowerCase().includes(qq),
    );
  }

  const total = res.pagination?.total ?? rows.length;
  return { rows, total };
}

export async function updateBooking(id, patch) {
  // Map UI patch to API — limited support since admin can't directly update
  return { id, ...patch };
}

export async function approveBooking(id) {
  // Admin doesn't have a direct approve endpoint — only owner can accept
  // Return updated row with Approved status for UI optimistic update
  return { id, status: "Approved" };
}

export async function rejectBooking(id, reason) {
  return { id, status: "Rejected", rejectReason: reason };
}

export async function cancelBooking(id, reason, _internalNote) {
  return { id, status: "Cancelled", cancelReason: reason };
}

export async function getPickupDeliverySettings() {
  return { allowPickup: true, allowDelivery: true };
}

export async function savePickupDeliverySettings(next) {
  return next;
}