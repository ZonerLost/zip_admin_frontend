import React, { useEffect, useMemo, useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiBell, FiBellOff } from "react-icons/fi";

/**
 * Which notifications the platform sends.
 *
 * What was here before described a notification system that does not exist: email and SMS channel
 * toggles, editable subject/body templates for a "photo upload reminder" and a "case progress
 * update", and a rule for sending a reminder N hours after a booking ends. The backend has none of
 * it — notifications are in-app only, their wording is hardcoded server-side, and there is no
 * scheduler. Save returned its own argument, so every control reported success and changed nothing.
 *
 * This is what the server actually honours: a master switch and per-type muting, both read by the
 * notification sender before it creates a notification. Muting a type stops it being created at
 * all, rather than hiding it — a stored-but-hidden notification would still drive unread counts.
 */

// Human labels for the server's type keys. A type the server knows but this map does not still
// renders, using its raw key, rather than disappearing from the list.
const TYPE_LABELS = {
  booking_request: "Booking request",
  booking_accepted: "Booking accepted",
  booking_declined: "Booking declined",
  booking_cancelled: "Booking cancelled",
  booking_completed: "Booking completed",
  review_received: "Review received",
  message_received: "New chat message",
  dispute_opened: "Dispute opened",
  dispute_resolved: "Dispute resolved",
  payment_received: "Payment received",
  item_added: "Item listed",
  account_created: "Account created",
  identity_verified: "Identity verified",
};

function labelFor(type) {
  return TYPE_LABELS[type] || type;
}

export default function NotificationsSettingsForm({ value, onSave }) {
  const [enabled, setEnabled] = useState(value?.enabled !== false);
  const [muted, setMuted] = useState(() => new Set(value?.mutedTypes || []));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");

  // Reset when the server sends a fresh copy, so a reload is not quietly overwritten by stale state.
  useEffect(() => {
    setEnabled(value?.enabled !== false);
    setMuted(new Set(value?.mutedTypes || []));
  }, [value]);

  const types = useMemo(() => value?.availableTypes || [], [value]);

  const dirty = useMemo(() => {
    const was = new Set(value?.mutedTypes || []);
    if ((value?.enabled !== false) !== enabled) return true;
    if (was.size !== muted.size) return true;
    for (const t of muted) if (!was.has(t)) return true;
    return false;
  }, [value, enabled, muted]);

  function toggle(type) {
    setDone("");
    setMuted((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  async function save() {
    setErr("");
    setDone("");
    setBusy(true);
    try {
      await onSave({ enabled, mutedTypes: [...muted] });
      setDone("Saved.");
    } catch (e) {
      setErr(e?.message || "Could not save notification settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-brand-soft p-2 text-brand">
            {enabled ? (
              <FiBell className="h-4 w-4" />
            ) : (
              <FiBellOff className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Notification Delivery
            </p>
            <p className="text-xs text-neutral-500">
              In-app notifications. Muting a type stops it being sent.
            </p>
          </div>
        </div>
        <Button disabled={!dirty || busy} onClick={save}>
          {busy ? "Saving..." : "Save"}
        </Button>
      </div>

      {err ? (
        <div className="border-b bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div>
      ) : null}
      {done ? (
        <div className="border-b bg-green-50 px-4 py-2 text-sm text-green-700">
          {done}
        </div>
      ) : null}

      <div className="space-y-4 p-4">
        <label className="flex items-start justify-between gap-3 rounded-2xl border p-3">
          <span className="min-w-0">
            <span className="block text-sm font-medium text-neutral-900">
              Send notifications
            </span>
            <span className="block text-xs text-neutral-500">
              Off stops every in-app notification across the platform. Nothing
              is stored while this is off, so turning it back on does not
              deliver a backlog.
            </span>
          </span>
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0"
            checked={enabled}
            onChange={(e) => {
              setDone("");
              setEnabled(e.target.checked);
            }}
          />
        </label>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold text-neutral-700">
              Types ({types.length})
            </p>
            <p className="text-xs text-neutral-500">
              Counts are the last 30 days
            </p>
          </div>

          {types.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No notification types reported by the server.
            </p>
          ) : (
            <div
              className={
                "space-y-2 " + (enabled ? "" : "pointer-events-none opacity-50")
              }
            >
              {types.map((t) => {
                const isMuted = muted.has(t.type);
                return (
                  <label
                    key={t.type}
                    className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-neutral-900">
                        {labelFor(t.type)}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {t.last30Days} sent
                        {isMuted ? " · muted" : ""}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0"
                      checked={!isMuted}
                      onChange={() => toggle(t.type)}
                      aria-label={`Send ${labelFor(t.type)}`}
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {value?.updatedAt ? (
          <p className="text-xs text-neutral-500">
            Last changed {new Date(value.updatedAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-xs text-neutral-500">
            Never changed — everything is sent by default.
          </p>
        )}
      </div>
    </Card>
  );
}
