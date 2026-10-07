import { api } from "./apiClient.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getDashboardSummary(_startIso, _endIso) {
  const res = await api.get("/admin/stats");
  const d = res.data;
  return {
    users: d.users?.total ?? 0,
    listings: d.items?.active ?? 0,
    bookings: d.bookings?.total ?? 0,
    disputes: d.bookings?.pending ?? 0,
    revenue: d.revenue?.total ?? 0,
  };
}


// Chart series — grouped from real payment/booking data
export async function getRevenueSeries(_startIso, _endIso) {
  const res = await api.get("/admin/payments?limit=100");
  const payments = (res.data || []).filter((p) => p.status === "completed");
  const grouped = {};
  payments.forEach((p) => {
    const date = new Date(p.createdAt).toLocaleDateString(undefined, {
      month: "short", day: "numeric",
    });
    if (!grouped[date]) grouped[date] = { label: date, revenue: 0, bookings: 0 };
    grouped[date].revenue += p.amount ?? 0;
    grouped[date].bookings += 1;
  });
  const series = Object.values(grouped);
  return series.length ? series : [{ label: "No data", revenue: 0, bookings: 0 }];
}

export async function getBookingsSeries(_startIso, _endIso) {
  const res = await api.get("/admin/bookings?limit=100");
  const bookings = res.data || [];
  const grouped = {};
  bookings.forEach((b) => {
    const date = new Date(b.createdAt).toLocaleDateString(undefined, {
      month: "short", day: "numeric",
    });
    if (!grouped[date]) grouped[date] = { label: date, bookings: 0 };
    grouped[date].bookings += 1;
  });
  const series = Object.values(grouped);
  return series.length ? series : [{ label: "No data", bookings: 0 }];
}