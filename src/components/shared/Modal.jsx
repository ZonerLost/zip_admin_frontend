import React, { useEffect } from "react";
import { cn } from "../../utils/cn.js";
import { FiX } from "react-icons/fi";
import { lockBodyScroll } from "../../utils/bodyScrollLock.js";

export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (!open) return;

    window.addEventListener("keydown", onKey);
    const unlockBodyScroll = lockBodyScroll();

    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-full sm:max-w-3xl lg:max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-2xl",
          "max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-48px)]",
          "flex flex-col",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <button
            type="button"
            className="rounded-xl p-2 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Scrollable Body (both axes) */}
        <div className="min-h-0 flex-1 overflow-auto px-4 sm:px-5 py-4">
          {children}
        </div>

        {/* Footer (sticky at bottom) */}
        {footer ? (
          <div className="shrink-0 border-t px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
