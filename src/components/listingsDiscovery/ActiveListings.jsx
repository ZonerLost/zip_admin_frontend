import React, { useEffect, useMemo, useState } from "react";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import * as listingsService from "../../services/listingsDiscovery.service.js";
import ChartCard from "../shared/ChartCard.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function ActiveListings() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();
  const [rows, setRows] = useState([]);
  const [prevRows, setPrevRows] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await listingsService.getActiveListingsSeries(
        resolvedRange?.start,
        resolvedRange?.end,
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
      if (!comparePreviousYear) return setPrevRows(null);
      const prev = resolvePreviousYear ? resolvePreviousYear() : null;
      if (!prev) return setPrevRows(null);
      const data = await listingsService.getActiveListingsSeries(
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

  const summary = useMemo(() => {
    const total = rows.reduce((a, r) => a + (r.activeListings || 0), 0);
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    const peak = rows.reduce(
      (p, r) => (r.activeListings > (p.activeListings || 0) ? r : p),
      rows[0] || { activeListings: 0 },
    );
    return { total, avg, peak };
  }, [rows]);

  const merged = useMemo(() => {
    if (!rows || !rows.length) return [];
    return rows.map((r, i) => {
      const prevByLabel = prevRows
        ? prevRows.find((p) => p.label === r.label)
        : null;
      const prevByIndex = prevRows && prevRows[i] ? prevRows[i] : null;
      const prev = prevByLabel || prevByIndex || null;
      return {
        label: r.label,
        activeListings: r.activeListings,
        prevActiveListings: prev ? prev.activeListings : null,
      };
    });
  }, [rows, prevRows]);

  return (
    <ChartCard
      title="Active Listings"
      subtitle="Listings that received engagement"
    >
      {!rows.length ? (
        <EmptyState
          title="No active listings"
          description="No engagement in this range."
        />
      ) : (
        <div className="w-full mt-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.total}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Avg / period</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.avg}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Peak</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.peak.activeListings}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {summary.peak.label}
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
                  <CartesianGrid stroke="#E9ECEB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="activeListings"
                    name="Current"
                    stroke="#075985"
                    strokeWidth={3}
                    fill="rgba(7,89,133,0.08)"
                    dot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="prevActiveListings"
                    name="Prev year"
                    stroke="rgba(7,89,133,0.7)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    fillOpacity={0.06}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[rgb(7,89,133)]" />
              Current
            </div>
            {prevRows ? (
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgba(7,89,133,0.7)" }}
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
