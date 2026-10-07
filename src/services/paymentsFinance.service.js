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
    // The table needs to know whether a row can be refunded. "refunded" used to map to "Succeeded",
    // which reads as a successful charge, and nothing distinguished a payment that could still be
    // refunded from one that could not — so the action was offered on every row.
    isRefunded: p.status === "refunded",
    canRefund: p.status === "completed",
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

/**
 * Refunds one payment, in full.
 *
 * The endpoint takes a payment id (and resolves a booking id to that booking's completed payment).
 * It reverses the transfer to the owner and the application fee, so the platform and the owner each
 * give back their share.
 *
 * There is no partial refund: the server never sends an `amount` to Stripe, so the whole intent is
 * refunded. The old modal collected an Amount and a User and sent neither — an administrator could
 * type 50 against a $200 charge and move the full $200.
 */
export async function createRefund({ paymentId, reason }) {
  if (!paymentId) throw new Error("No payment selected.");
  const trimmed = String(reason || "").trim();
  if (trimmed.length < 3) throw new Error("Give a reason for the refund.");
  const res = await api.put(`/admin/payments/${paymentId}/refund`, { reason: trimmed });
  return normalize(res.data);
}

/**
 * The live pricing the platform charges, read from the server.
 *
 * This used to return a hardcoded `{ platformFeePercent: 5 }` and the save was a no-op, so the form
 * showed an editable 5% that was both unsaveable and **wrong** — the real model is 15% owner
 * commission plus a 3% renter fee with a $3.99 minimum, and taxes on both. Showing a made-up number
 * next to a Save button is worse than showing nothing.
 *
 * Reported read-only: these are compile-time constants in the backend pricing helper, deliberately,
 * because changing a commission rate changes every quote from that moment on and belongs in a
 * release rather than a text box.
 */
export async function getFeeSettings() {
  const res = await api.get("/payments/config");
  const p = res.data?.pricing || {};
  return {
    readOnly: true,
    currency: res.data?.currency || "CAD",
    ownerCommissionPercent: p.ownerCommissionPercent ?? null,
    renterFeePercent: p.renterFeePercent ?? null,
    renterFeeMinimum: p.renterFeeMinimum ?? null,
    taxes: Array.isArray(p.taxes) ? p.taxes : [],
    explainer: p.atussaFeeExplainer || "",
  };
}