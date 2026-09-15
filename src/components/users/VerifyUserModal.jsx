import React from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

export default function VerifyUserModal({ open, user, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      title={user?.verified ? "Mark as Unverified" : "Verify User"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm?.(user)}>
            {user?.verified ? "Unverify" : "Verify"}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">
        {user?.verified
          ? "This will mark the user as unverified."
          : "This will mark the user as verified."}
      </p>
      <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="font-medium text-slate-900">{user?.name}</p>
        <p className="text-slate-600">{user?.email}</p>
      </div>
    </Modal>
  );
}
