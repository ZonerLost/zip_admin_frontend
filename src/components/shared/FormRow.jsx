import React from "react";

export default function FormRow({ label, hint, children }) {
  return (
    <div>
      {label ? (
        <label className="text-xs font-medium text-slate-600">{label}</label>
      ) : null}
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
