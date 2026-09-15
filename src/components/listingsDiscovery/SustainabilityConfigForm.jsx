import React, { useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiGlobe } from "react-icons/fi";

export default function SustainabilityConfigForm({ value, onSave }) {
  const [local, setLocal] = useState(value);

  function update(patch) {
    setLocal((s) => ({ ...s, ...patch }));
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Sustainability Config
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Carbon source + mapping controls.
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(71,95,88,0.10)] p-2 text-[rgb(var(--brand))]">
          <FiGlobe className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600">
            Data Source
          </label>
          <select
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
            value={local.dataSource}
            onChange={(e) => update({ dataSource: e.target.value })}
          >
            <option value="manual">Manual</option>
            <option value="api">Carbon Database API</option>
          </select>
        </div>

        {local.dataSource === "api" ? (
          <div>
            <label className="text-xs font-medium text-slate-600">
              API URL
            </label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
              value={local.apiUrl || ""}
              onChange={(e) => update({ apiUrl: e.target.value })}
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Store keys securely later via environment variables.
            </p>
          </div>
        ) : null}

        <label className="flex items-center gap-3 rounded-2xl border bg-white p-4">
          <input
            type="checkbox"
            checked={local.mappingEnabled}
            onChange={(e) => update({ mappingEnabled: e.target.checked })}
            className="h-4 w-4 accent-[rgb(var(--brand))]"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">
              Enable Category → CO₂ Mapping
            </p>
            <p className="text-xs text-slate-500">
              Use mapping table for item footprint factors.
            </p>
          </div>
        </label>

        <div className="flex justify-end">
          <Button onClick={() => onSave(local)}>Save</Button>
        </div>
      </div>
    </Card>
  );
}
