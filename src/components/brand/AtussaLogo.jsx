import React from "react";
import { cn } from "../../utils/cn.js";
import markUrl from "../../assets/brand/atussa-mark.svg";
import horizontalUrl from "../../assets/brand/atussa-logo-horizontal.svg";
import verticalUrl from "../../assets/brand/atussa-logo-vertical.svg";

const LOGOS = {
  mark: { src: markUrl, width: 100, height: 100 },
  horizontal: { src: horizontalUrl, width: 377.31, height: 100 },
  vertical: { src: verticalUrl, width: 146, height: 139.35 },
};

export default function AtussaLogo({ variant = "horizontal", className, alt = "Atussa", ...props }) {
  const logo = LOGOS[variant] ?? LOGOS.horizontal;
  return (
    <img
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={alt}
      draggable={false}
      className={cn("block select-none", className)}
      {...props}
    />
  );
}
