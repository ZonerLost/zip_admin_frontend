import React from "react";

export default function LoadingState({ text = "Loading..." }) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
