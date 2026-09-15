import { useContext } from "react";
import { DashboardRangeContext } from "./_internalDashboardContext.js";

const EMPTY = {
  range: null,
  resolvedRange: null,
  comparePreviousYear: false,
  setRange: () => {},
  setComparePreviousYear: () => {},
  resolvePreviousYear: () => null,
};

export function useDashboardRange() {
  return useContext(DashboardRangeContext) || EMPTY;
}

export default useDashboardRange;
