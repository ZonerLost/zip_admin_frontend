import React from "react";
import Card from "../shared/Card.jsx";
import { FaLeaf } from "react-icons/fa";

export default function SustainabilitySnapshot({ co2SavedKg }) {
  const co2 = Number(co2SavedKg ?? 0) || 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Sustainability Snapshot
          </p>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {co2.toFixed(1)}{" "}
            <span className="text-sm font-medium text-slate-600">
              kg CO₂ saved
            </span>
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(71,95,88,0.10)] p-2 text-[rgb(var(--brand))]">
          <FaLeaf className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
