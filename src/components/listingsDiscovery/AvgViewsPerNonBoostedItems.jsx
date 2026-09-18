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

export default function AvgViewsPerNonBoostedItems() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();
  const [rows, setRows] = useState([]);
  const [prevRows, setPrevRows] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await listingsService.getAvgViewsNonBoostedSeries(
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
      const data = await listingsService.getAvgViewsNonBoostedSeries(
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
    const total = rows.reduce((a, r) => a + (r.avgViewsNonBoosted || 0), 0);
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    const peak = rows.reduce(
      (p, r) => (r.avgViewsNonBoosted > (p.avgViewsNonBoosted || 0) ? r : p),
      rows[0] || { avgViewsNonBoosted: 0 },
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
        avgViewsNonBoosted: r.avgViewsNonBoosted,
        prevAvgViewsNonBoosted: prev ? prev.avgViewsNonBoosted : null,
      };
    });
  }, [rows, prevRows]);

  return (
    <ChartCard
      title="Avg Views / Non-Boosted"
      subtitle="Views for non-boosted listings"
    >
      {!rows.length ? (
        <EmptyState
          title="No data"
          description="No non-boosted view data in this range."
        />
      ) : (
        <div className="w-full mt-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-neutral-500">Avg</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {summary.avg}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {summary.total}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-neutral-500">Peak</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {summary.peak.avgViewsNonBoosted}
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
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="avgViewsNonBoosted"
                    name="Current"
                    stroke={chart.current}
                    strokeWidth={3}
                    fill={chart.current} fillOpacity={0.08}
                    dot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="prevAvgViewsNonBoosted"
                    name="Prev year"
                    stroke={chart.previous}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    fillOpacity={0.06}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
