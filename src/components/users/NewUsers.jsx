import React, { useEffect, useMemo, useState } from "react";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import * as usersService from "../../services/users.service.js";
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

export default function NewUsers() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();
  const [rows, setRows] = useState([]);
  const [prevRows, setPrevRows] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!resolvedRange) return setRows([]);
      const data = await usersService.getNewUsersSeries(
        resolvedRange.start,
        resolvedRange.end,
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
      if (!resolvedRange || !comparePreviousYear) return setPrevRows(null);
      const prev = resolvePreviousYear();
      if (!prev) return setPrevRows(null);
      const data = await usersService.getNewUsersSeries(prev.start, prev.end);
      if (!alive) return;
      setPrevRows(data);
    }
    loadPrev();
    return () => {
      alive = false;
    };
  }, [resolvedRange, comparePreviousYear, resolvePreviousYear]);

  const summary = useMemo(() => {
    const total = rows.reduce((a, r) => a + (r.signups || 0), 0);
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    const peakRow = rows.reduce(
      (p, r) => (r.signups > (p.signups || 0) ? r : p),
      rows[0] || { signups: 0 },
    );
    return { total, avg, peak: peakRow };
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
        signups: r.signups,
        prevSignups: prev ? prev.signups : null,
      };
    });
  }, [rows, prevRows]);

  return (
    <ChartCard title="New Users" subtitle="Signups over time">
      <div className="text-xs sm:text-sm text-slate-500">
        Showing: {resolvedRange?.label}
      </div>
      {!rows.length ? (
        <EmptyState
          title="No signups"
          description="No new users in this range."
        />
      ) : (
        <div className="w-full mt-4">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Total Signups</p>
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
            <div className="rounded-2xl border bg-white p-3">
              <p className="text-xs text-slate-500">Peak</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {summary.peak.signups}
              </p>
              <p className="mt-1 text-xs text-slate-500">
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
                  <defs>
                    <linearGradient id="signFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(71,95,88,0.22)" />
                      <stop offset="100%" stopColor="rgba(71,95,88,0.05)" />
                    </linearGradient>
                    <linearGradient
                      id="prevSignFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(71,95,88,0.14)" />
                      <stop offset="100%" stopColor="rgba(71,95,88,0.02)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E9ECEB" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    name="Current"
                    stroke="#475F58"
                    strokeWidth={3}
                    fill="url(#signFill)"
                    dot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="prevSignups"
                    name="Prev year"
                    stroke="rgba(71,95,88,0.75)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    fill="url(#prevSignFill)"
                    fillOpacity={0.12}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[rgb(71,95,88)]" />
              Current
            </div>
            {prevRows ? (
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgba(71,95,88,0.75)" }}
                />
                Prev year
              </div>
            ) : null}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
