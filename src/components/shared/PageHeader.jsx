import React from "react";

export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="w-full sm:w-auto">{right}</div> : null}
    </div>
  );
}
