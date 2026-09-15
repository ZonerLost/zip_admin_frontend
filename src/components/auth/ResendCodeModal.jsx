import React from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

export default function ResendCodeModal({ open, email, onClose, onResend }) {
  return (
    <Modal
      open={open}
      title="Resend Code"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onResend?.(email)}>Resend</Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">
        We’ll resend a verification code to{" "}
        <span className="font-medium">{email}</span>.
      </p>
    </Modal>
  );
}
