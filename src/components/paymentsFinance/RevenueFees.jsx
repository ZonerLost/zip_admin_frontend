import React, { useEffect, useState } from "react";
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
import * as svc from "../../services/paymentsFinance.service.js";

export default function RevenueFees({
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
      const data = await svc.getRevenueFeesSeries(start, end);
      if (!alive) return;
      setRows(data);
    }
    load();
    return () => {
      alive = false;
    };
  }, [start, end]);

  useEffect(() => {
    if (!comparePrev) return void setPrevRows(null);
    let alive = true;
    async function loadPrev() {
      if (!prevStart || !prevEnd) return setPrevRows(null);
      const data = await svc.getRevenueFeesSeries(prevStart, prevEnd);
      if (!alive) return;
      setPrevRows(data);
    }
    loadPrev();
    return () => {
      alive = false;
    };
  }, [comparePrev, prevStart, prevEnd]);

  return (
    <ChartCard
      title="Revenue (Fees)"
      subtitle="Platform fees collected over time"
    >
      {!rows.length ? (
        <EmptyState title="No data" />
      ) : (
        <div className="rounded-2xl border bg-white p-3">
          <div className="w-full h-44 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rows.map((r, i) => ({
                  label: r.label,
                  value: r.revenueFees,
                  prevValue:
                    prevRows &&
                    (prevRows.find((p) => p.label === r.label) || prevRows[i])
                      ? (
                          prevRows.find((p) => p.label === r.label) ||
                          prevRows[i]
                        ).revenueFees
                      : null,
                }))}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke="#E9ECEB" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => `$${v}`} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Current"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fill="rgba(139,92,246,0.08)"
                  dot={{ r: 4 }}
                />
                {prevRows ? (
                  <Area
                    type="monotone"
                    dataKey="prevValue"
                    name="Prev year"
                    stroke="rgba(139,92,246,0.75)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    fill="rgba(139,92,246,0.02)"
                  />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
