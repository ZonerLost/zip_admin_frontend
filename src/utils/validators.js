export function formatMoney(amount, currency = "USD") {
  const n = Number(amount || 0);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(n);
}

export function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function isEmail(v) {
  const s = String(v || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function required(v) {
  return String(v || "").trim().length > 0;
}

export function minLen(v, n) {
  return String(v || "").trim().length >= n;
}

// Backwards-compatible alias: some components import `isValidEmail`
export const isValidEmail = isEmail;
