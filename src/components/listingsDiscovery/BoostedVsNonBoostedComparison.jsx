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

export default function BoostedVsNonBoostedComparison() {
  const { resolvedRange } = useDashboardRange();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await listingsService.getBoostedVsNonBoostedSeries(
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

  const summary = useMemo(() => {
    if (!rows.length) return { avgBoosted: 0, avgNon: 0, pctDiff: 0 };
    const avgBoosted = Math.round(
      rows.reduce((a, r) => a + (r.boosted || 0), 0) / rows.length,
    );
    const avgNon = Math.round(
      rows.reduce((a, r) => a + (r.nonBoosted || 0), 0) / rows.length,
    );
    const pct = avgNon ? Math.round(((avgBoosted - avgNon) / avgNon) * 100) : 0;
    return { avgBoosted, avgNon, pctDiff: pct };
  }, [rows]);

  return (
    <ChartCard title="Boosted vs Non-Boosted" subtitle="Comparison of views">
      {!rows.length ? (
        <EmptyState
          title="No data"
          description="No comparison data in this range."
        />
      ) : (
        <div className="w-full mt-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Avg Boosted</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.avgBoosted}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Avg Non-Boosted</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.avgNon}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Avg % Diff</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.pctDiff}%
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-3">
            <div className="w-full h-44 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={rows}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <Legend verticalAlign="top" align="right" />
                  <CartesianGrid stroke="#E9ECEB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="boosted"
                    name="Boosted"
                    stroke="#059669"
                    strokeWidth={3}
                    fill="rgba(5,150,105,0.08)"
                    dot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="nonBoosted"
                    name="Non-boosted"
                    stroke="#374151"
                    strokeWidth={3}
                    fill="rgba(55,65,81,0.06)"
                    dot={false}
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
