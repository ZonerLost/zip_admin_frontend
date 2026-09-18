import React from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";

export default function LeaderboardsPrivacyForm({
  value,
  onChange,
  onSave,
  saving,
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-neutral-900">
        Leaderboards & Privacy
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Control how names and city are displayed (theme-consistent settings UI).
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-neutral-600">
            Name Format
          </label>
          <select
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
            value={value.nameFormat}
            onChange={(e) => onChange({ ...value, nameFormat: e.target.value })}
          >
            <option value="first_name_initial">
              First name + initial (Sarah G.)
            </option>
            <option value="alias">Alias only</option>
            <option value="full_name">Full name</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border bg-white p-4">
          <input
            type="checkbox"
            checked={value.showCity}
            onChange={(e) => onChange({ ...value, showCity: e.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">Show City</p>
            <p className="text-xs text-neutral-500">
              Display city next to leaderboard entries.
            </p>
          </div>
        </label>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
