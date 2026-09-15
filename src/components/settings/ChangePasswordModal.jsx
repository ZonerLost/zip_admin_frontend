import React, { useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

export default function ChangePasswordModal({ open, onClose, onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");

  const can =
    currentPassword.length >= 4 &&
    newPassword.length >= 8 &&
    confirm === newPassword;

  async function submit() {
    setErr("");
    try {
      await onSubmit({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      onClose();
    } catch (e) {
      setErr(e?.message || "Failed to update password.");
    }
  }

  return (
    <Modal
      open={open}
      title="Change Password"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!can} onClick={submit}>
            Update
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        <div>
          <label className="text-xs font-medium text-slate-600">
            Current Password
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-600">
              New Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">Min 8 characters.</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">
              Confirm
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
