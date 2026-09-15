import React, { useCallback, useMemo, useState } from "react";
import { DashboardRangeContext } from "./_internalDashboardContext.js";
import {
  startOfDay,
  endOfDay,
  formatISO,
  resolvePreset,
} from "../utils/dateRange.js";

export function DashboardRangeProvider({ children }) {
  const [range, setRange] = useState({ preset: "last_week" });
  const [comparePreviousYear, setComparePreviousYear] = useState(false);

  const resolved = useMemo(() => {
    if (!range) return null;
    if (range.preset === "custom" && range.start && range.end) {
      const s = startOfDay(new Date(range.start));
      const e = endOfDay(new Date(range.end));
      return {
        start: s,
        end: e,
        label: `Custom ${formatISO(s)} → ${formatISO(e)}`,
      };
    }
    const r = resolvePreset(range.preset);
    if (r) return r;
    return resolvePreset("last_week");
  }, [range]);

  const resolvePreviousYear = useCallback(() => {
    if (!resolved) return null;
    const s = new Date(resolved.start);
    const e = new Date(resolved.end);
    s.setFullYear(s.getFullYear() - 1);
    e.setFullYear(e.getFullYear() - 1);
    return {
      start: startOfDay(s),
      end: endOfDay(e),
      label: `Prev year: ${s.getFullYear()}`,
    };
  }, [resolved]);

  const value = {
    range,
    setRange,
    resolvedRange: resolved,
    comparePreviousYear,
    setComparePreviousYear,
    resolvePreviousYear,
  };

  return (
    <DashboardRangeContext.Provider value={value}>
      {children}
    </DashboardRangeContext.Provider>
  );
}
