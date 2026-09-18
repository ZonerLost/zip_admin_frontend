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
import { chart } from "../../theme/palette.js";

export default function TotalListings() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();

  const [rows, setRows] = useState([]);
  const [prevRows, setPrevRows] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await listingsService.getTotalListingsSeries(
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
      const data = await listingsService.getTotalListingsSeries(
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

  useEffect(() => {
    let alive = true;
    async function loadMetrics() {
      const m = await listingsService.getListingsMetrics(
        resolvedRange?.start,
        resolvedRange?.end,
      );
      if (!alive) return;
      setMetrics(m);
    }
    loadMetrics();
    return () => {
      alive = false;
    };
  }, [resolvedRange]);

  const summary = useMemo(() => {
    const total = rows.reduce((a, r) => a + (r.totalListings || 0), 0);
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    const peakRow = rows.reduce(
      (p, r) => (r.totalListings > (p.totalListings || 0) ? r : p),
      rows[0] || { totalListings: 0 },
    );
    return { total, avg, peak: peakRow };
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
        totalListings: r.totalListings,
        prevTotalListings: prev ? prev.totalListings : null,
      };
    });
  }, [rows, prevRows]);

  return (
    <ChartCard title="Total Listings" subtitle="Listings over time">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-xs sm:text-sm text-neutral-500">
          Showing: {resolvedRange?.label}
        </div>
      </div>

      {!rows.length ? (
        <EmptyState
          title="No listings"
          description="No listings in this range."
        />
      ) : (
        <div className="w-full mt-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {metrics ? metrics.total : summary.total}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-neutral-500">Avg / period</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {summary.avg}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-neutral-500">Peak</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {summary.peak.totalListings}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
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
                  <defs>
                    <linearGradient id="totalFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={chart.current} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={chart.current} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient
                      id="prevTotalFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={chart.previous} stopOpacity={0.14} />
                      <stop offset="100%" stopColor={chart.previous} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="totalListings"
                    name="Current"
                    stroke={chart.current}
                    strokeWidth={3}
                    fill="url(#totalFill)"
                    dot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="prevTotalListings"
                    name="Prev year"
                    stroke={chart.previous}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    fill="url(#prevTotalFill)"
                    fillOpacity={0.12}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chart.current }} />
              Current
            </div>
            {prevRows ? (
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chart.previous }}
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
