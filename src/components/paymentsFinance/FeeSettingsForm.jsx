import React, { useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiSettings } from "react-icons/fi";

export default function FeeSettingsForm({ value, onSave }) {
  const [local, setLocal] = useState(value);

  function update(patch) {
    setLocal((s) => ({ ...s, ...patch }));
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Fee Settings</p>
          <p className="mt-1 text-sm text-slate-500">
            Platform fee + payout scheduling.
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(71,95,88,0.10)] p-2 text-[rgb(var(--brand))]">
          <FiSettings className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-600">
              Platform Fee (%)
            </label>
            <input
              type="number"
              step="0.5"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
              value={local.platformFeePercent}
              onChange={(e) =>
                update({ platformFeePercent: Number(e.target.value || 0) })
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">
              Fixed Fee ($)
            </label>
            <input
              type="number"
              step="0.5"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={local.fixedFee}
              onChange={(e) =>
                update({ fixedFee: Number(e.target.value || 0) })
              }
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">
            Payout Delay (days)
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            value={local.payoutDelayDays}
            onChange={(e) =>
              update({ payoutDelayDays: Number(e.target.value || 0) })
            }
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(local)}>Save</Button>
        </div>
      </div>
    </Card>
  );
}
