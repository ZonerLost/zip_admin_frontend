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
  Legend,
} from "recharts";
import * as svc from "../../services/bookingsOperations.service.js";
import { chart } from "../../theme/palette.js";

export default function TotalBookings({
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
      const data = await svc.getTotalBookingsSeries(start, end);
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
      const data = await svc.getTotalBookingsSeries(prevStart, prevEnd);
      if (!alive) return;
      setPrevRows(data);
    }
    loadPrev();
    return () => {
      alive = false;
    };
  }, [comparePrev, prevStart, prevEnd]);

  const summary = useMemo(() => {
    const total = rows.reduce((a, r) => a + (r.totalBookings || 0), 0);
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    const peak = rows.reduce(
      (p, r) => (r.totalBookings > (p.totalBookings || 0) ? r : p),
      rows[0] || { totalBookings: 0 },
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
        totalBookings: r.totalBookings,
        prevTotalBookings: prev ? prev.totalBookings : null,
      };
    });
  }, [rows, prevRows]);

  return (
    <ChartCard title="Total bookings" subtitle="Bookings over time">
      {!rows.length ? (
        <EmptyState title="No data" />
      ) : (
        <div className="w-full">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {summary.total}
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
                {summary.peak.totalBookings}
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
                    dataKey="totalBookings"
                    name="Current"
                    stroke={chart.current}
                    strokeWidth={3}
                    fill={chart.current} fillOpacity={0.12}
                    dot={{ r: 4 }}
                  />
                  {prevRows ? (
                    <Area
                      type="monotone"
                      dataKey="prevTotalBookings"
                      name="Prev year"
                      stroke={chart.previous}
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                      fill={chart.previous}
                      fillOpacity={0.12}
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
