import React, { useEffect, useMemo, useState } from "react";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import * as listingsService from "../../services/listingsDiscovery.service.js";
import ChartCard from "../shared/ChartCard.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function ViewsPctDifferenceBoostedVsNonBoosted() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await listingsService.getBoostedVsNonBoostedSeries(
        resolvedRange?.start,
        resolvedRange?.end,
      );
      if (!alive) return;
      const pct = data.map((r) => ({
        label: r.label,
        boosted: r.boosted,
        nonBoosted: r.nonBoosted,
        pctDiff: r.nonBoosted
          ? Math.round(((r.boosted - r.nonBoosted) / r.nonBoosted) * 100)
          : null,
      }));
      setRows(pct);
    }
    load();
    return () => {
      alive = false;
    };
  }, [resolvedRange]);

  const summary = useMemo(() => {
    if (!rows.length) return { avgPct: 0, peak: null };
    const avg = Math.round(
      rows.reduce((a, r) => a + (r.pctDiff || 0), 0) / rows.length,
    );
    const peak = rows.reduce(
      (p, r) => (Math.abs(r.pctDiff || 0) > Math.abs(p.pctDiff || 0) ? r : p),
      rows[0],
    );
    return { avg, peak };
  }, [rows]);

  return (
    <ChartCard
      title="% Diff: Boosted vs Non-Boosted"
      subtitle="Percentage difference in views"
    >
      {!rows.length ? (
        <EmptyState
          title="No data"
          description="No comparison data in this range."
        />
      ) : (
        <div className="w-full mt-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Avg % diff</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.avgPct ?? summary.avg}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Peak %</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.peak ? `${summary.peak.pctDiff}%` : "-"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {summary.peak?.label}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Points</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {rows.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-3">
            <div className="w-full h-44 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={rows}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <Legend verticalAlign="top" align="right" />
                  <CartesianGrid stroke="#E9ECEB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="pctDiff"
                    name="% diff"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
