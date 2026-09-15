import React from "react";
import { cn } from "../../utils/cn.js";

export default function Button({
  children,
  className,
  variant = "primary",
  disabled,
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition active:scale-[0.99]";
  const styles =
    variant === "outline"
      ? "border bg-white text-slate-900 hover:bg-slate-50"
      : "bg-[rgb(var(--brand))] text-white hover:opacity-95";

  return (
    <button
      type={type}
      className={cn(
        base,
        styles,
        disabled && "opacity-60 pointer-events-none",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
