import React, { useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";
import { isValidEmail } from "../../utils/validators.js";

export default function ForgotPasswordModal({
  open,
  emailDefault = "",
  onClose,
  onSubmit,
}) {
  const [email, setEmail] = useState(emailDefault);

  const can = isValidEmail(email);

  return (
    <Modal
      open={open}
      title="Forgot Password"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!can} onClick={() => onSubmit?.(email)}>
            Send Reset
          </Button>
        </div>
      }
    >
      <p className="text-sm text-neutral-600">
        We’ll send instructions to your email.
      </p>
      <div className="mt-4">
        <label className="text-xs font-medium text-neutral-600">Email</label>
        <input
          className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
    </Modal>
  );
}
