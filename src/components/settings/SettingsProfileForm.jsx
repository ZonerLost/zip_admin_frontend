import React, { useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiUser } from "react-icons/fi";

export default function SettingsProfileForm({ value, onSave }) {
  const [local, setLocal] = useState(value);

  function update(patch) {
    setLocal((s) => ({ ...s, ...patch }));
  }

  const can =
    (local.name || "").trim().length >= 2 &&
    (local.email || "").trim().length >= 5;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Profile</p>
          <p className="mt-1 text-sm text-neutral-500">Admin account details.</p>
        </div>
        <div className="rounded-2xl bg-brand-soft p-2 text-brand">
          <FiUser className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-neutral-600">Name</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
            value={local.name || ""}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Email</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            value={local.email || ""}
            onChange={(e) => update({ email: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Phone</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            value={local.phone || ""}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </div>

        <div className="flex justify-end">
          <Button disabled={!can} onClick={() => onSave(local)}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
