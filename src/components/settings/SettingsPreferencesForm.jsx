import React, { useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiSliders } from "react-icons/fi";

export default function SettingsPreferencesForm({ value, onSave }) {
  const [local, setLocal] = useState(value);

  function update(patch) {
    setLocal((s) => ({ ...s, ...patch }));
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Preferences</p>
          <p className="mt-1 text-sm text-neutral-500">
            UI behavior and defaults.
          </p>
        </div>
        <div className="rounded-2xl bg-brand-soft p-2 text-brand">
          <FiSliders className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-3 rounded-2xl border bg-white p-4">
          <input
            type="checkbox"
            checked={Boolean(local.compactTables)}
            onChange={(e) => update({ compactTables: e.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">Compact tables</p>
            <p className="text-xs text-neutral-500">
              Show denser rows for admin tables.
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border bg-white p-4">
          <input
            type="checkbox"
            checked={Boolean(local.showHelpHints)}
            onChange={(e) => update({ showHelpHints: e.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">Show hints</p>
            <p className="text-xs text-neutral-500">
              Display small helper text across pages.
            </p>
          </div>
        </label>

        <div>
          <label className="text-xs font-medium text-neutral-600">
            Default Page Size
          </label>
          <select
            className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
            value={local.defaultPageSize ?? 10}
            onChange={(e) =>
              update({ defaultPageSize: Number(e.target.value || 10) })
            }
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(local)}>Save</Button>
        </div>
      </div>
    </Card>
  );
}
