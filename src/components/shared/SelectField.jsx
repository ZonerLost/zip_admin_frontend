import React from "react";
import { cn } from "../../utils/cn.js";

export default function SelectField({
  label,
  error,
  className,
  children,
  ...props
}) {
  return (
    <div>
      {label ? (
        <label className="text-xs font-medium text-slate-600">{label}</label>
      ) : null}
      <select
        className={cn(
          "mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
