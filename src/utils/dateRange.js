export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
export function formatISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function resolvePreset(preset) {
  const now = new Date();
  const today = startOfDay(now);
  if (preset === "last_year") {
    const y = now.getFullYear() - 1;
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31);
    return {
      start: startOfDay(start),
      end: endOfDay(end),
      label: `Last year (${y})`,
    };
  }
  if (preset === "last_12_months") {
    const end = today;
    const start = new Date(end);
    start.setMonth(start.getMonth() - 11);
    return {
      start: startOfDay(start),
      end: endOfDay(end),
      label: "Last 12 months",
    };
  }
  if (preset === "last_month") {
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthEnd = new Date(firstOfThisMonth);
    lastMonthEnd.setDate(0); // last day previous month
    const lastMonthStart = new Date(
      lastMonthEnd.getFullYear(),
      lastMonthEnd.getMonth(),
      1,
    );
    return {
      start: startOfDay(lastMonthStart),
      end: endOfDay(lastMonthEnd),
      label: "Last month",
    };
  }
  if (preset === "last_week") {
    const end = today;
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return {
      start: startOfDay(start),
      end: endOfDay(end),
      label: "Last 7 days",
    };
  }
  return null;
}
