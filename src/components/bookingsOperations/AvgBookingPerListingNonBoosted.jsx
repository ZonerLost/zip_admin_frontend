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
import { chart } from "../../theme/palette.js";

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
    if (!comparePrev || !prevStart || !prevEnd) return;
    let alive = true;
    async function loadPrev() {
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

  const activePrevRows = comparePrev && prevStart && prevEnd ? prevRows : null;

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
              <p className="text-xs text-neutral-500">Avg / period</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
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
                      activePrevRows &&
                      (activePrevRows.find((p) => p.label === r.label) ||
                        activePrevRows[i])
                        ? (
                            activePrevRows.find((p) => p.label === r.label) ||
                            activePrevRows[i]
                          ).avgNonBoosted
                        : null,
                  }))}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Current"
                    stroke={chart.current}
                    strokeWidth={3}
                    fill={chart.current} fillOpacity={0.08}
                    dot={{ r: 4 }}
                  />
                  {activePrevRows ? (
                    <Area
                      type="monotone"
                      dataKey="prevValue"
                      name="Prev year"
                      stroke={chart.previous}
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                      fill={chart.previous} fillOpacity={0.02}
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
