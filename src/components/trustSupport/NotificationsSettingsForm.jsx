import React, { useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiBell } from "react-icons/fi";

export default function NotificationsSettingsForm({ value, onSave }) {
  const [local, setLocal] = useState(value);

  function update(patch) {
    setLocal((s) => ({ ...s, ...patch }));
  }

  function updateTemplate(key, patch) {
    setLocal((s) => ({
      ...s,
      templates: {
        ...s.templates,
        [key]: { ...(s.templates?.[key] || {}), ...patch },
      },
    }));
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Notifications Settings
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Templates + rules for reminders and case updates.
          </p>
        </div>
        <div className="rounded-2xl bg-brand-soft p-2 text-brand">
          <FiBell className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <label className="flex items-center gap-3 rounded-2xl border bg-white p-4">
          <input
            type="checkbox"
            checked={Boolean(local.enabled)}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Enable Notifications
            </p>
            <p className="text-xs text-neutral-500">
              Global notifications switch.
            </p>
          </div>
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          {["email", "push", "sms"].map((k) => (
            <label
              key={k}
              className="flex items-center gap-3 rounded-2xl border bg-white p-4"
            >
              <input
                type="checkbox"
                checked={Boolean(local.channels?.[k])}
                onChange={(e) =>
                  update({
                    channels: { ...local.channels, [k]: e.target.checked },
                  })
                }
                className="h-4 w-4 accent-brand"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {k.toUpperCase()}
                </p>
                <p className="text-xs text-neutral-500">Channel</p>
              </div>
            </label>
          ))}
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-semibold text-neutral-900">
            Template: Photo Upload Reminder
          </p>
          <label className="mt-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(local.templates?.photoUploadReminder?.enabled)}
              onChange={(e) =>
                updateTemplate("photoUploadReminder", {
                  enabled: e.target.checked,
                })
              }
              className="h-4 w-4 accent-brand"
            />
            <span className="text-sm text-neutral-700">Enabled</span>
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Subject
              </label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                value={local.templates?.photoUploadReminder?.subject || ""}
                onChange={(e) =>
                  updateTemplate("photoUploadReminder", {
                    subject: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Rule: Hours after booking end
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                value={local.rules?.photoReminderHoursAfterEnd ?? 0}
                onChange={(e) =>
                  update({
                    rules: {
                      ...local.rules,
                      photoReminderHoursAfterEnd: Number(e.target.value || 0),
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-neutral-600">Body</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={local.templates?.photoUploadReminder?.body || ""}
              onChange={(e) =>
                updateTemplate("photoUploadReminder", { body: e.target.value })
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-semibold text-neutral-900">
            Template: Case Progress Update
          </p>
          <label className="mt-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(local.templates?.caseProgressUpdate?.enabled)}
              onChange={(e) =>
                updateTemplate("caseProgressUpdate", {
                  enabled: e.target.checked,
                })
              }
              className="h-4 w-4 accent-brand"
            />
            <span className="text-sm text-neutral-700">Enabled</span>
          </label>

          <label className="mt-3 flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
            <input
              type="checkbox"
              checked={Boolean(local.rules?.sendCaseUpdatesOnStatusChange)}
              onChange={(e) =>
                update({
                  rules: {
                    ...local.rules,
                    sendCaseUpdatesOnStatusChange: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 accent-brand"
            />
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Send on status change
              </p>
              <p className="text-xs text-neutral-500">
                Auto notify users when dispute status changes.
              </p>
            </div>
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Subject
              </label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                value={local.templates?.caseProgressUpdate?.subject || ""}
                onChange={(e) =>
                  updateTemplate("caseProgressUpdate", {
                    subject: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">Body</label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                value={local.templates?.caseProgressUpdate?.body || ""}
                onChange={(e) =>
                  updateTemplate("caseProgressUpdate", { body: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(local)}>Save</Button>
        </div>
      </div>
    </Card>
  );
}
