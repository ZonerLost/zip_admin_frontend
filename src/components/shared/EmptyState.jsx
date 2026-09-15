import React from "react";

export default function EmptyState({ title = "Nothing here", description }) {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
