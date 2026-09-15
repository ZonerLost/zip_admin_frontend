import React from "react";
import Card from "../shared/Card.jsx";

export default function LeaderboardTable({ title, rows }) {
  return (
    <Card className="p-0">
      <div className="border-b p-4">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="min-w-130 w-full">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="py-2">Name</th>
              <th className="py-2">City</th>
              <th className="py-2">CO₂ Saved</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t text-sm">
                <td className="py-3 font-medium text-slate-900">{r.name}</td>
                <td className="py-3 text-slate-700">{r.city ?? "-"}</td>
                <td className="py-3 text-slate-700">{r.co2Kg.toFixed(1)} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
