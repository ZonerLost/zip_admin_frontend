import React from "react";
import { cn } from "../../utils/cn.js";

export default function Alert({ type = "info", title, children, className }) {
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={cn("rounded-2xl border p-3", styles, className)}>
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      {children ? <div className="mt-1 text-sm">{children}</div> : null}
    </div>
  );
}
