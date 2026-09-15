import React, { useEffect, useMemo, useState } from "react";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import * as dashboardService from "../../services/dashboard.service.js";
import ChartCard from "../shared/ChartCard.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import Button from "../shared/Button.jsx";
import { formatMoney } from "../../utils/formatters.js";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Legend,
} from "recharts";

export default function BookingsRevenueChart({ loading = false }) {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();

  const [rows, setRows] = useState([]);
  const [prevRows, setPrevRows] = useState(null);

  const merged = React.useMemo(() => {
    if (!rows || !rows.length) return [];
    return rows.map((r, i) => {
      // prefer matching by label first, fallback to index
      const prevByLabel = prevRows
        ? prevRows.find((p) => p.label === r.label)
        : null;
      const prevByIndex = prevRows && prevRows[i] ? prevRows[i] : null;
      const prev = prevByLabel || prevByIndex || null;
      return {
        ...r,
        prevRevenue: prev ? prev.revenue : null,
        prevBookings: prev ? prev.bookings : null,
      };
    });
  }, [rows, prevRows]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!resolvedRange) return setRows([]);
      const data = await dashboardService.getRevenueSeries(
        resolvedRange.start,
        resolvedRange.end,
      );
      if (!alive) return;
      setRows(data);
    }
    load();
    return () => {
      alive = false;
    };
  }, [resolvedRange]);

  useEffect(() => {
    let alive = true;
    async function loadPrev() {
      if (!resolvedRange || !comparePreviousYear) return setPrevRows(null);
      const prev = resolvePreviousYear();
      if (!prev) return setPrevRows(null);
      const data = await dashboardService.getRevenueSeries(
        prev.start,
        prev.end,
      );
      if (!alive) return;
      setPrevRows(data);
    }
    loadPrev();
    return () => {
      alive = false;
    };
  }, [resolvedRange, comparePreviousYear, resolvePreviousYear]);

  const stats = useMemo(() => {
    const totalRevenue = rows.reduce((a, r) => a + (r.revenue || 0), 0);
    const totalBookings = rows.reduce((a, r) => a + (r.bookings || 0), 0);
    const avgOrder = totalBookings ? totalRevenue / totalBookings : 0;
    return { totalRevenue, totalBookings, avgOrder };
  }, [rows]);

  return (
    <ChartCard title="Bookings Revenue" subtitle="Revenue over time">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-xs sm:text-sm text-slate-500">
          Showing: {resolvedRange?.label}
        </div>
        <div className="flex items-center flex-wrap gap-2"></div>
      </div>

      {loading ? (
        <div className="h-55 animate-pulse rounded-2xl bg-slate-100 mt-4" />
      ) : !rows.length ? (
        <EmptyState
          title="No revenue data yet"
          description="Once bookings start, revenue trends will appear here."
        />
      ) : (
        <div className="w-full mt-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Total Revenue</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatMoney(stats.totalRevenue)}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Total Bookings</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {stats.totalBookings}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Avg / Booking</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatMoney(stats.avgOrder)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-3">
            <div className="w-full h-44 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={merged}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <Legend verticalAlign="top" align="right" />
                  <defs>
                    <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(71,95,88,0.22)" />
                      <stop offset="100%" stopColor="rgba(71,95,88,0.05)" />
                    </linearGradient>
                    <linearGradient
                      id="prevRevFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(71,95,88,0.14)" />
                      <stop offset="100%" stopColor="rgba(71,95,88,0.02)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E9ECEB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatMoney(v)} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (!value && value !== 0) return ["—", name];
                      if (String(name).toLowerCase().includes("revenue"))
                        return [formatMoney(value), name];
                      return [value, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#475F58"
                    fillOpacity={1}
                    fill="url(#revFill)"
                    dot={{ r: 4 }}
                    name="Revenue"
                  />
                  {prevRows ? (
                    <Area
                      // prev series now pulled from merged data
                      dataKey="prevRevenue"
                      type="monotone"
                      stroke="rgba(71,95,88,0.75)"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                      fill="url(#prevRevFill)"
                      fillOpacity={0.12}
                      name="Prev revenue"
                    />
                  ) : null}
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#A0B5AF"
                    dot={false}
                    name="Bookings"
                  />
                  {prevRows ? (
                    <Line
                      type="monotone"
                      dataKey="prevBookings"
                      stroke="rgba(160,181,175,0.6)"
                      dot={false}
                      strokeDasharray="4 4"
                      name="Prev bookings"
                    />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[rgb(71,95,88)]" />
              Current
            </div>
            {prevRows ? (
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgba(71,95,88,0.75)" }}
                />
                Prev year
              </div>
            ) : null}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
