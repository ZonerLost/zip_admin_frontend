import React from "react";
import { cn } from "../../utils/cn.js";

const MAP = {
  Open: "bg-amber-50 text-amber-700 border-amber-200",
  Investigating: "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Deactivated: "bg-slate-100 text-slate-700 border-slate-300 font-medium",
  Banned: "bg-rose-100 text-rose-800 border-rose-300 font-medium",
  Disabled: "bg-rose-50 text-rose-700 border-rose-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pickup: "bg-neutral-50 text-neutral-700 border-neutral-200",
  Delivery: "bg-blue-50 text-blue-700 border-blue-200",
  Unknown: "bg-neutral-50 text-neutral-700 border-neutral-200",
  Hidden: "bg-neutral-50 text-neutral-700 border-neutral-200",
  Visible: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Removed: "bg-rose-50 text-rose-700 border-rose-200",
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unverified: "bg-neutral-50 text-neutral-700 border-neutral-200",
  "ID verified": "bg-emerald-100 text-emerald-800 border-emerald-300 font-medium",
  "ID not verified": "bg-amber-100 text-amber-800 border-amber-300 font-medium",
  "Email verified": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Email unverified": "bg-neutral-100 text-neutral-600 border-neutral-300",
  Admin: "bg-purple-100 text-purple-800 border-purple-300 font-medium",
  User: "bg-blue-50 text-blue-700 border-blue-200",
  Owner: "bg-blue-50 text-blue-700 border-blue-200",
  Renter: "bg-neutral-100 text-neutral-700 border-neutral-200",
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Featured: "bg-amber-50 text-amber-700 border-amber-200",
  Normal: "bg-neutral-50 text-neutral-700 border-neutral-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-neutral-50 text-neutral-700 border-neutral-200",
};

export default function StatusPill({ value }) {
  const key = String(value || "-");
  const cls =
    MAP[key] ||
    "bg-brand-soft text-brand border-brand/20";
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
