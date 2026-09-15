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

export default function RevenueInsurance({
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
      const data = await svc.getRevenueInsuranceSeries(start, end);
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
      const data = await svc.getRevenueInsuranceSeries(prevStart, prevEnd);
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
      title="Revenue (Insurance)"
      subtitle="Revenue from insurance charges"
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
                  value: r.revenueInsurance,
                  prevValue:
                    prevRows &&
                    (prevRows.find((p) => p.label === r.label) || prevRows[i])
                      ? (
                          prevRows.find((p) => p.label === r.label) ||
                          prevRows[i]
                        ).revenueInsurance
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
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fill="rgba(245,158,11,0.08)"
                  dot={{ r: 4 }}
                />
                {prevRows ? (
                  <Area
                    type="monotone"
                    dataKey="prevValue"
                    name="Prev year"
                    stroke="rgba(245,158,11,0.75)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    fill="rgba(245,158,11,0.02)"
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
