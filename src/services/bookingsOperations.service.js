import { api } from "./apiClient.js";

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
    deliveryMethod: b.deliveryType === "delivery" ? "Delivery" : "Pickup",
    status: mapStatus(b.status),
    amount: b.pricing?.totalAmount ?? 0,
    cancelReason: b.cancelReason ?? null,
    declineReason: b.declineReason ?? null,
    // Payment state is independent of status — a paid booking is still "accepted" — so the two are
    // carried separately. A booking that was never paid cannot be refunded, and the Refund action
    // used to be offered on every row regardless.
    paymentStatus: b.paymentStatus ?? "unpaid",
    isPaid: b.paymentStatus === "paid",
    refunded: b.paymentStatus === "refunded",
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

// ── Chart series ──────────────────────────────────────────
//
// These used to be generated locally: buildEmptySeries() produced a row of zeros per day, so every
// chart on the page drew a flat line under a "Total 0" caption no matter what the database held.
//
// GET /admin/bookings/series returns all of them in one request. The nine chart components still
// each call their own function, so the request is shared through a small cache keyed by the range —
// nine components asking at once produce one network call, not nine.

const seriesCache = new Map();
const SERIES_CACHE_MAX = 8;

function rangeKey(start, end) {
  return `${start ?? ""}|${end ?? ""}`;
}

async function fetchSeries(start, end) {
  const key = rangeKey(start, end);
  if (seriesCache.has(key)) return seriesCache.get(key);

  const params = new URLSearchParams();
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  if (s && !Number.isNaN(s.getTime())) params.set("start", s.toISOString());
  if (e && !Number.isNaN(e.getTime())) params.set("end", e.toISOString());

  const promise = api
    .get(`/admin/bookings/series?${params.toString()}`)
    .then((res) => res.data ?? { series: [], listings: {} })
    // A failed fetch must not be cached as the answer: the next range change would keep showing it.
    .catch((err) => {
      seriesCache.delete(key);
      throw err;
    });

  seriesCache.set(key, promise);
  if (seriesCache.size > SERIES_CACHE_MAX) {
    seriesCache.delete(seriesCache.keys().next().value);
  }
  return promise;
}

/** Charts label points by day; the API returns ISO dates. */
function labelFor(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? isoDate
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

async function mapSeries(start, end, field, outKey) {
  const { series } = await fetchSeries(start, end);
  return (series || []).map((row) => ({
    label: labelFor(row.date),
    [outKey]: row[field] ?? 0,
  }));
}

export async function getTotalBookingsSeries(start, end) {
  return mapSeries(start, end, "total", "totalBookings");
}
export async function getAmountOfRequestsSeries(start, end) {
  return mapSeries(start, end, "requests", "requests");
}
export async function getAvgResponseTimeSeries(start, end) {
  return mapSeries(start, end, "avgResponseMs", "avgResponseMs");
}
export async function getAmountAcceptedSeries(start, end) {
  return mapSeries(start, end, "accepted", "accepted");
}
export async function getAmountInstantBookingSeries(start, end) {
  return mapSeries(start, end, "instant", "instant");
}
export async function getAmountNotAcceptedSeries(start, end) {
  return mapSeries(start, end, "notAccepted", "notAccepted");
}
export async function getAvgBookingPerListingNonBoostedSeries(start, end) {
  return mapSeries(start, end, "avgPerNonBoostedListing", "avgNonBoosted");
}
export async function getAvgBookingPerBoostedSeries(start, end) {
  return mapSeries(start, end, "avgPerBoostedListing", "avgBoosted");
}
export async function getPctDiffBoostedVsNonBoostedSeries(start, end) {
  const { series } = await fetchSeries(start, end);
  return (series || []).map((row) => {
    const boosted = row.avgPerBoostedListing ?? 0;
    const base = row.avgPerNonBoostedListing ?? 0;
    // With no non-boosted baseline there is no percentage to state. Zero is the honest answer; a
    // division by zero would render as Infinity on the chart.
    const pctDiff = base > 0 ? Math.round(((boosted - base) / base) * 100) : 0;
    return { label: labelFor(row.date), pctDiff };
  });
}

// ── Table ─────────────────────────────────────────────────

export async function listBookings({
  q = "",
  status = "all",
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", Math.min(pageSize, 50));

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

  // Client-side search: the bookings endpoint has no full-text search. Note this filters the current
  // page only, so a match on a later page will not appear — the alternative is pretending to search
  // the whole set.
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

// ── Actions ───────────────────────────────────────────────
//
// There is deliberately no approveBooking or rejectBooking here. There never was a working one:
// both returned a plain object so the row flipped to "Approved" and reverted on the next refresh.
// They are gone rather than reimplemented, because whether to rent out an item is the owner's
// decision — an administrator accepting on their behalf would commit them to a rental they never
// agreed to.

/** Cancels a booking as an administrator. The reason is shown to both the renter and the owner. */
export async function cancelBooking(id, reason) {
  const trimmed = String(reason || "").trim();
  if (trimmed.length < 3) throw new Error("Give a reason for the cancellation.");
  const res = await api.put(`/admin/bookings/${id}/cancel`, { reason: trimmed });
  return {
    ok: true,
    // True when the booking was paid, so the caller can offer a refund as a separate step.
    refundOutstanding: Boolean(res.data?.refundOutstanding),
  };
}

/**
 * Refunds a booking's payment.
 *
 * The endpoint takes a payment id, but resolves a booking id to that booking's completed payment,
 * so the booking id is what gets passed. Reverses the transfer to the owner and the platform fee.
 */
export async function refundBooking(id, reason = "Refunded by admin") {
  await api.put(`/admin/payments/${id}/refund`, { reason });
  return { ok: true };
}

// ── Splits ────────────────────────────────────────────────

// Delivery/pickup and instant/request counts for bookings created in the range.
// startYmd/endYmd are "YYYY-MM-DD" in the admin's local time.
export async function getBookingSplits(startYmd, endYmd) {
  const params = new URLSearchParams();
  const start = new Date(`${startYmd}T00:00:00`);
  const end = new Date(`${endYmd}T23:59:59.999`);
  if (!Number.isNaN(start.getTime())) params.set("start", start.toISOString());
  if (!Number.isNaN(end.getTime())) params.set("end", end.toISOString());
  const res = await api.get(`/admin/stats?${params.toString()}`);
  const b = res.data?.bookings || {};
  return {
    delivery: b.byDeliveryType?.delivery ?? 0,
    pickup: b.byDeliveryType?.pickup ?? 0,
    instant: b.byBookingType?.instant ?? 0,
    request: b.byBookingType?.request ?? 0,
  };
}
