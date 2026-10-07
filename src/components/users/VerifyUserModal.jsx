import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

/**
 * Approves or revokes a user's **identity** verification.
 *
 * Every label here used to key off `user.verified`, which is the *email* flag, while the action it
 * triggers flips identity verification. The two disagree constantly — a user with a confirmed email
 * and an unreviewed document got a button reading "Unverify" that actually approved them.
 */
export default function VerifyUserModal({ open, user, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    setBusy(false);
  }, [user, open]);

  const isVerified = Boolean(user?.identityVerified);

  async function confirm() {
    setErr("");
    setBusy(true);
    try {
      await onConfirm?.(user);
    } catch (e) {
      // Previously a failure produced nothing at all: no message, no change, modal still open.
      setErr(e?.message || "That could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isVerified ? "Revoke identity verification" : "Approve identity"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={confirm}>
            {busy ? "Saving..." : isVerified ? "Revoke" : "Approve"}
          </Button>
        </div>
      }
    >
      {err ? (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <p className="text-sm text-neutral-600">
        {isVerified
          ? "This removes the identity verification from this account."
          : "This marks the user's identity as verified."}
      </p>

      {!isVerified && !user?.hasIdentityDocument ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          This user has not uploaded an identity document, so there is nothing
          to check. Open their details to review a document before approving.
        </div>
      ) : null}
      <div className="mt-3 rounded-2xl bg-neutral-50 p-3 text-sm">
        <p className="font-medium text-neutral-900">{user?.name}</p>
        <p className="text-neutral-600">{user?.email}</p>
      </div>
    </Modal>
  );
}
