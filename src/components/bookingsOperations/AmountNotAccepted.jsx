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

export default function AmountNotAccepted({
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
      const data = await svc.getAmountNotAcceptedSeries(start, end);
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
      const data = await svc.getAmountNotAcceptedSeries(prevStart, prevEnd);
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
    const total = rows.reduce((a, r) => a + (r.notAccepted || 0), 0);
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    return { total, avg };
  }, [rows]);

  const merged = useMemo(() => {
    if (!rows || !rows.length) return [];
    return rows.map((r, i) => {
      const prevByLabel = activePrevRows
        ? activePrevRows.find((p) => p.label === r.label)
        : null;
      const prevByIndex =
        activePrevRows && activePrevRows[i] ? activePrevRows[i] : null;
      const prev = prevByLabel || prevByIndex || null;
      return {
        label: r.label,
        notAccepted: r.notAccepted,
        prevNotAccepted: prev ? prev.notAccepted : null,
      };
    });
  }, [rows, activePrevRows]);

  return (
    <ChartCard
      title="Amount request NOT accepted"
      subtitle="Not accepted over time"
    >
      {!rows.length ? (
        <EmptyState title="No data" />
      ) : (
        <div>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <div className="w-full h-44 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={merged}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="notAccepted"
                    name="Not accepted"
                    stroke={chart.current}
                    strokeWidth={3}
                    fill={chart.current} fillOpacity={0.08}
                    dot={{ r: 4 }}
                  />
                  {activePrevRows ? (
                    <Area
                      type="monotone"
                      dataKey="prevNotAccepted"
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
