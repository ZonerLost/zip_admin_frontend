import React from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
