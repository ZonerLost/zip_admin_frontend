import React from "react";
import { cn } from "../../utils/cn.js";

export default function MetricsGrid({
  children,
  className,
  minItemWidth = "11.5rem",
  style,
  ...props
}) {
  return (
    <div
      className={cn("grid gap-3", className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}), 1fr))`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
