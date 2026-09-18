import React from "react";
import { cn } from "../../utils/cn.js";

export default function IconButton({
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn("rounded-xl p-2 hover:bg-neutral-100 transition", className)}
      {...props}
    />
  );
}
