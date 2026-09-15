import React, { useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

export default function ApproveRejectBookingModal({
  open,
  booking,
  onClose,
  onApprove,
  onReject,
}) {
  const [reason, setReason] = useState("Not eligible");

  return (
    <Modal
      open={open}
      title="Approve / Reject Booking"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => onReject?.(booking, reason)}>
            Reject
          </Button>
          <Button onClick={() => onApprove?.(booking)}>Approve</Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">
        Booking: <span className="font-semibold">{booking?.listingTitle}</span>
      </p>

      <div className="mt-4">
        <label className="text-xs font-medium text-slate-600">
          Reject reason (optional)
        </label>
        <input
          className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
        />
      </div>
    </Modal>
  );
}
