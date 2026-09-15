import React from "react";
import { cn } from "../../utils/cn.js";

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn("rounded-2xl border bg-white shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}
