import React, { useEffect, useState, useMemo } from "react";
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
} from "recharts";
import * as svc from "../../services/bookingsOperations.service.js";

export default function AvgBookingPerListingNonBoosted({
  start,
  end,
  comparePrev,
  prevStart,
  prevEnd,
}) {
  const [rows, setRows] = useState([]);
  const [prevRows, setPrevRows] = useState(null);
  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await svc.getAvgBookingPerListingNonBoostedSeries(
        start,
        end,
      );
      if (!alive) return;
      setRows(data);
    }
    load();
    return () => {
      alive = false;
    };
  }, [start, end]);

  useEffect(() => {
    if (!comparePrev) return setPrevRows(null);
    let alive = true;
    async function loadPrev() {
      if (!prevStart || !prevEnd) return setPrevRows(null);
      const data = await svc.getAvgBookingPerListingNonBoostedSeries(
        prevStart,
        prevEnd,
      );
      if (!alive) return;
      setPrevRows(data);
    }
    loadPrev();
    return () => {
      alive = false;
    };
  }, [comparePrev, prevStart, prevEnd]);

  const summary = useMemo(() => {
    const avg = rows.length
      ? (
          rows.reduce((a, r) => a + (r.avgNonBoosted || 0), 0) / rows.length
        ).toFixed(2)
      : 0;
    return { avg };
  }, [rows]);

  return (
    <ChartCard
      title="Avg bookings per listing (non-boosted)"
      subtitle="Per period average"
    >
      {!rows.length ? (
        <EmptyState title="No data" />
      ) : (
        <div>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Avg / period</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.avg}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <div className="w-full h-44 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={rows.map((r, i) => ({
                    label: r.label,
                    value: r.avgNonBoosted,
                    prevValue:
                      prevRows &&
                      (prevRows.find((p) => p.label === r.label) || prevRows[i])
                        ? (
                            prevRows.find((p) => p.label === r.label) ||
                            prevRows[i]
                          ).avgNonBoosted
                        : null,
                  }))}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid stroke="#E9ECEB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Current"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fill="rgba(37,99,235,0.08)"
                    dot={{ r: 4 }}
                  />
                  {prevRows ? (
                    <Area
                      type="monotone"
                      dataKey="prevValue"
                      name="Prev year"
                      stroke="rgba(37,99,235,0.75)"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                      fill="rgba(37,99,235,0.02)"
                    />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
