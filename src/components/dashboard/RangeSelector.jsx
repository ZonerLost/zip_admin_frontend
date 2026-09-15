import React from "react";
import { useDashboardRange } from "../../context/useDashboardRange.js";

export default function RangeSelector({ showCompare = true, wrap = true }) {
  const { range, setRange, comparePreviousYear, setComparePreviousYear } =
    useDashboardRange();

  const onPreset = (e) => {
    const p = e.target.value;
    setRange({ preset: p });
  };

  return (
    <div
      className={
        wrap
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-wrap items-center gap-2"
      }
    >
      <select
        value={range?.preset || "last_week"}
        onChange={onPreset}
        className="rounded-full border bg-white px-4 py-2 text-sm outline-none"
      >
        <option value="last_year">Last year (Jan - Dec)</option>
        <option value="last_12_months">Last 12 months</option>
        <option value="last_month">Last month</option>
        <option value="last_week">Last week</option>
        <option value="custom">Specific dates</option>
      </select>

      {range?.preset === "custom" ? (
        <>
          <input
            type="date"
            value={range.start || ""}
            onChange={(e) =>
              setRange((r) => ({
                ...(r || {}),
                preset: "custom",
                start: e.target.value,
              }))
            }
            className="rounded-full border bg-white px-3 py-2 text-sm outline-none"
          />
          <input
            type="date"
            value={range.end || ""}
            onChange={(e) =>
              setRange((r) => ({
                ...(r || {}),
                preset: "custom",
                end: e.target.value,
              }))
            }
            className="rounded-full border bg-white px-3 py-2 text-sm outline-none"
          />
        </>
      ) : null}

      {showCompare ? (
        <label className="ml-2 flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
          <input
            type="checkbox"
            checked={comparePreviousYear}
            onChange={(e) => setComparePreviousYear(e.target.checked)}
          />
          <span className="whitespace-nowrap">Compare prev year</span>
        </label>
      ) : null}
    </div>
  );
}
