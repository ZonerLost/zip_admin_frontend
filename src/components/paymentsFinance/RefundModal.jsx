import React, { useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

export default function RefundModal({ open, onClose, onSubmit }) {
  const [bookingId, setBookingId] = useState("");
  const [user, setUser] = useState("");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("Refund approved");

  const can =
    String(bookingId).trim().length > 0 &&
    String(user).trim().length > 0 &&
    Number(amount) > 0;

  async function submit() {
    if (!can) return;
    await onSubmit({ bookingId, user, amount: Number(amount), reason });
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Create Refund"
      onClose={onClose}
      centered={true}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!can} onClick={submit}>
            Create
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-neutral-600">
            Booking ID
          </label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="bk_123"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">User</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="User name"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-neutral-600">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">Reason</label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
