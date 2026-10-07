import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

/**
 * Confirms refunding one payment.
 *
 * What this replaced was closer to a trap than a form. It asked for a booking id typed by hand
 * (placeholder `bk_123`, while real ids are 24-character hex), a **User** name that was collected,
 * required, and then never sent anywhere, and an **Amount** — also never sent. The server refunds
 * the full payment intent and has no partial-refund path, so an administrator could type 50 against
 * a $200 charge, press Create, and move the whole $200. Nothing on screen said otherwise.
 *
 * So: no free-text id (the payment comes from its row), no amount field, and the figure that will
 * actually move is stated plainly. A reason is required, because it is recorded against the payment.
 */
const QUICK_REASONS = [
  "Owner cancelled the booking",
  "Item not as described",
  "Item unavailable on collection",
  "Duplicate charge",
  "Resolved in the renter's favour",
];

export default function RefundModal({ open, payment, onClose, onSubmit }) {
  const [reason, setReason] = useState(QUICK_REASONS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setReason(QUICK_REASONS[0]);
    setErr("");
    setBusy(false);
  }, [payment, open]);

  const amount = Number(payment?.amount || 0);
  const can = reason.trim().length >= 3 && !busy && amount > 0;

  async function submit() {
    if (!can) return;
    setErr("");
    setBusy(true);
    try {
      await onSubmit({ paymentId: payment.id, reason: reason.trim() });
      onClose();
    } catch (e) {
      // Stays open with the reason: a refund that silently failed would leave an admin believing
      // the renter had their money back.
      setErr(e?.message || "The refund could not be issued.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Refund payment"
      onClose={onClose}
      centered={true}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!can} onClick={submit}>
            {busy ? "Refunding..." : `Refund $${amount.toFixed(2)}`}
          </Button>
        </div>
      }
    >
      {!payment ? (
        <p className="text-sm text-neutral-500">No payment selected.</p>
      ) : (
        <div className="space-y-3">
          {err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <div className="rounded-2xl border bg-neutral-50 p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-neutral-500">Refunding</span>
              <span className="text-lg font-semibold text-neutral-900">
                ${amount.toFixed(2)} {payment.currency || "CAD"}
              </span>
            </div>
            <dl className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Paid by</dt>
                <dd className="truncate text-neutral-900">{payment.user}</dd>
              </div>
              {payment.payeeName && payment.payeeName !== "—" ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">Owner</dt>
                  <dd className="truncate text-neutral-900">
                    {payment.payeeName}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Booking</dt>
                <dd className="truncate font-mono text-neutral-700">
                  {payment.bookingId}
                </dd>
              </div>
              {payment.createdAt ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">Charged</dt>
                  <dd className="text-neutral-900">
                    {new Date(payment.createdAt).toLocaleString()}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              This refunds the <strong>full amount</strong> — partial refunds
              are not supported. The transfer to the owner and Atussa&rsquo;s
              commission are both reversed, so the owner&rsquo;s balance is
              reduced by their share.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">
              Reason
            </label>
            <select
              className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
              value={QUICK_REASONS.includes(reason) ? reason : "__other"}
              onChange={(e) => {
                setErr("");
                setReason(e.target.value === "__other" ? "" : e.target.value);
              }}
            >
              {QUICK_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="__other">Something else...</option>
            </select>

            {!QUICK_REASONS.includes(reason) ? (
              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this being refunded?"
                autoFocus
              />
            ) : null}

            <p className="mt-1 text-xs text-neutral-500">
              Recorded against the payment and sent to Stripe.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
