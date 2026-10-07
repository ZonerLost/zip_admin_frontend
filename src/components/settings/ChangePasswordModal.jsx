import React, { useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

export default function ChangePasswordModal({ open, onClose, onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  // Mirrors the server's rule exactly. Accepting a password here that the server then rejects just
  // moves the error later and makes the form look broken.
  const strongEnough =
    newPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword);
  const can =
    currentPassword.length > 0 &&
    strongEnough &&
    confirm === newPassword &&
    currentPassword !== newPassword &&
    !busy;

  async function submit() {
    setErr("");
    setDone("");
    setBusy(true);
    try {
      await onSubmit({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      // Say so before closing. Closing silently is indistinguishable from dismissing the dialog,
      // which matters more than usual here: this screen used to claim success without changing
      // anything at all.
      setDone("Password updated.");
      setTimeout(() => {
        setDone("");
        onClose();
      }, 1200);
    } catch (e) {
      setErr(e?.message || "Failed to update password.");
    } finally {
      setBusy(false);
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
            {busy ? "Updating..." : "Update"}
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

        {done ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {done}
          </div>
        ) : null}

        <div>
          <label className="text-xs font-medium text-neutral-600">
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
            <label className="text-xs font-medium text-neutral-600">
              New Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-neutral-500">
              At least 8 characters, with an uppercase letter, a lowercase
              letter and a number.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
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
