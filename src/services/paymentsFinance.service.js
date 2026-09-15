import { api } from "./apiClient.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(p) {
  const payer = typeof p.payer === "object" ? p.payer : {};
  const payee = typeof p.payee === "object" ? p.payee : {};
  const booking = typeof p.booking === "object" ? p.booking : {};

  return {
    id: p._id,
    bookingId: booking._id ?? booking ?? "—",
    user: `${payer.firstName ?? ""} ${payer.lastName ?? ""}`.trim() || "—",
    payeeName: `${payee.firstName ?? ""} ${payee.lastName ?? ""}`.trim() || "—",
    type: p.status === "refunded" ? "Refund" : "Charge",
    status: mapStatus(p.status),
    amount: p.amount ?? 0,
    currency: p.currency ?? "CAD",
    method: p.method ?? "—",
    externalReference: p.externalReference ?? null,
    createdAt: p.createdAt,
  };
}

function mapStatus(apiStatus) {
  const map = {
    completed: "Succeeded",
    pending: "Pending",
    failed: "Failed",
    refunded: "Succeeded",
  };
  return map[apiStatus] ?? "Pending";
}

// ── Chart series helpers (kept for chart compatibility) ──

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

export async function getRevenueTotalSeries(_start, _end) {
  return buildEmptySeries("revenueTotal", _start, _end);
}
export async function getRevenueBoostedSeries(_start, _end) {
  return buildEmptySeries("revenueBoosted", _start, _end);
}
export async function getRevenueInsuranceSeries(_start, _end) {
  return buildEmptySeries("revenueInsurance", _start, _end);
}
export async function getRevenueFeesSeries(_start, _end) {
  return buildEmptySeries("revenueFees", _start, _end);
}
export async function getRefundsSeries(_start, _end) {
  return buildEmptySeries("refunds", _start, _end);
}

// ── Main CRUD ────────────────────────────────────────────

export async function listTransactions({
  q = "",
  type = "all",
  status = "all",
  page = 1,
  pageSize = 10,
  start: _start,
  end: _end,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", Math.min(pageSize, 50));

  // Map UI type → API status filter
  if (type === "Refund") params.set("status", "refunded");
  else if (status !== "all") {
    const statusMap = { Succeeded: "completed", Pending: "pending", Failed: "failed" };
    if (statusMap[status]) params.set("status", statusMap[status]);
  }

  const res = await api.get(`/admin/payments?${params.toString()}`);
  let rows = (res.data || []).map(normalize);

  if (q) {
    const qq = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        String(r.bookingId || "").toLowerCase().includes(qq) ||
        String(r.user || "").toLowerCase().includes(qq),
    );
  }

  const total = res.pagination?.total ?? rows.length;
  return { rows, total };
}

export async function createRefund(payload) {
  const res = await api.put(`/admin/payments/${payload.bookingId}/refund`, {
    reason: payload.reason || "Admin initiated refund",
  });
  return normalize(res.data);
}

export async function getFeeSettings() {
  return { platformFeePercent: 5 };
}

export async function saveFeeSettings(_next) {
  return _next;
}