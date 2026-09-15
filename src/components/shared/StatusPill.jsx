import React from "react";
import { cn } from "../../utils/cn.js";

const MAP = {
  Open: "bg-amber-50 text-amber-700 border-amber-200",
  Investigating: "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Disabled: "bg-rose-50 text-rose-700 border-rose-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pickup: "bg-slate-50 text-slate-700 border-slate-200",
  Delivery: "bg-blue-50 text-blue-700 border-blue-200",
  Unknown: "bg-slate-50 text-slate-700 border-slate-200",
  Hidden: "bg-slate-50 text-slate-700 border-slate-200",
  Visible: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Removed: "bg-rose-50 text-rose-700 border-rose-200",
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unverified: "bg-slate-50 text-slate-700 border-slate-200",
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Featured: "bg-amber-50 text-amber-700 border-amber-200",
  Normal: "bg-slate-50 text-slate-700 border-slate-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function StatusPill({ value }) {
  const key = String(value || "-");
  const cls =
    MAP[key] ||
    "bg-[rgba(71,95,88,0.10)] text-[rgb(var(--brand))] border-[rgba(71,95,88,0.18)]";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
        cls,
      )}
    >
      {key}
    </span>
  );
}
