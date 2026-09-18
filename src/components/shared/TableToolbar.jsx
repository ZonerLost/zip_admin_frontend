import React from "react";
import { FiSearch } from "react-icons/fi";

export default function TableToolbar({ value, onChange, right }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-[320px]">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-full border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
        />
      </div>
      {right ? <div className="w-full sm:w-auto">{right}</div> : null}
    </div>
  );
}
