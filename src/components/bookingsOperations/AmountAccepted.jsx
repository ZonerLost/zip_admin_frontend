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

export default function AmountAccepted({
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
      const data = await svc.getAmountAcceptedSeries(start, end);
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
      const data = await svc.getAmountAcceptedSeries(prevStart, prevEnd);
      if (!alive) return;
      setPrevRows(data);
    }
    loadPrev();
    return () => {
      alive = false;
    };
  }, [comparePrev, prevStart, prevEnd]);

  const summary = useMemo(() => {
    const total = rows.reduce((a, r) => a + (r.accepted || 0), 0);
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    return { total, avg };
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
        accepted: r.accepted,
        prevAccepted: prev ? prev.accepted : null,
      };
    });
  }, [rows, prevRows]);

  return (
    <ChartCard title="Amount request accepted" subtitle="Accepted over time">
      {!rows.length ? (
        <EmptyState title="No data" />
      ) : (
        <div>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <div className="w-full h-44 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={merged}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid stroke="#E9ECEB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="accepted"
                    name="Accepted"
                    stroke="#16A34A"
                    strokeWidth={3}
                    fill="rgba(16,163,84,0.08)"
                    dot={{ r: 4 }}
                  />
                  {prevRows ? (
                    <Area
                      type="monotone"
                      dataKey="prevAccepted"
                      name="Prev year"
                      stroke="rgba(16,163,84,0.75)"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                      fill="rgba(16,163,84,0.02)"
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
