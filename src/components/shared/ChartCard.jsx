import React from "react";
import Card from "./Card.jsx";

export default function ChartCard({ title, subtitle, right, children }) {
  return (
    <Card className="p-3 sm:p-5 h-full min-h-0 sm:min-h-105 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs sm:text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        <div className="w-full sm:w-auto">{right}</div>
      </div>
      <div className="mt-3 sm:mt-4 flex-1">{children}</div>
    </Card>
  );
}
