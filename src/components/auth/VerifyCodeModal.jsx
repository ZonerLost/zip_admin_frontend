import React from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

export default function VerifyCodeModal({ open, onClose, onGoVerify }) {
  return (
    <Modal
      open={open}
      title="Verification Required"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Later
          </Button>
          <Button onClick={onGoVerify}>Verify Now</Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">
        Please verify your email with the 6-digit code.
      </p>
    </Modal>
  );
}
