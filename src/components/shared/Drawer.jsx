import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { cn } from "../../utils/cn.js";
import { lockBodyScroll } from "../../utils/bodyScrollLock.js";

export default function Drawer({ open, title, onClose, children }) {
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
    <div className="fixed inset-0 z-110 flex items-center justify-center p-3 sm:p-0 sm:justify-end sm:items-stretch">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          // Mobile: centered dialog
          "relative flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border bg-white shadow-2xl",
          "max-h-[calc(100vh-24px)]",
          // Desktop: right drawer
          "sm:max-h-none sm:h-full sm:w-105 sm:max-w-xl sm:rounded-none sm:border-l sm:border-r-0"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <button
            type="button"
            className="rounded-xl p-2 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
