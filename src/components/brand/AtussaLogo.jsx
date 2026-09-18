import React from "react";
import { cn } from "../../utils/cn.js";
import markUrl from "../../assets/brand/atussa-mark.svg";
import horizontalUrl from "../../assets/brand/atussa-logo-horizontal.svg";
import verticalUrl from "../../assets/brand/atussa-logo-vertical.svg";

// Intrinsic viewBox size of each file, so the browser reserves the right box before load.
const LOGOS = {
  mark: { src: markUrl, width: 100, height: 100 },
  horizontal: { src: horizontalUrl, width: 377.31, height: 100 },
  vertical: { src: verticalUrl, width: 146, height: 139.35 },
};

/**
 * Atussa logo from the brand's logo system (brand guide "Système de logo").
 *
 * - `vertical` is the primary logo, `horizontal` fits bars and sidebars, `mark` is the pictogram.
 * - Size it with a height class (e.g. `h-9`); width follows the aspect ratio.
 * - Brand rules: keep 1x clear space around it, never stretch, recolour or add effects,
 *   and stay above 24px for the mark / 120px wide for full logos.
 *
 * Monochrome and wordmark-only variants live alongside in src/assets/brand/.
 */
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
