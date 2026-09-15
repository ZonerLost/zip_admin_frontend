import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "./Card.jsx";
import { cn } from "../../utils/cn.js";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  const toRef = useRef(0);

  useEffect(() => {
    const to = Number(value) || 0;
    const from = display;
    fromRef.current = from;
    toRef.current = to;
    startRef.current = null;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = clamp((ts - startRef.current) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplay(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  helperText,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 900,
  onClick,
}) {
  const display = useCountUp(value, duration);

  const formatted = useMemo(() => {
    const nf = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return nf.format(display);
  }, [display, decimals]);

  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Card
      className={cn(
        "min-w-0 h-full p-3 transition hover:shadow-md sm:p-4",
        onClick
          ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1"
          : "",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-xs leading-snug text-slate-500 [overflow-wrap:anywhere] sm:text-sm">
            {title}
          </p>
          <p className="mt-1 max-w-full text-lg font-semibold leading-tight text-slate-900 [overflow-wrap:anywhere] sm:text-2xl">
            {prefix}
            {formatted}
            {suffix}
          </p>
          {helperText ? (
            <p className="mt-1 text-xs leading-snug text-slate-500 [overflow-wrap:anywhere]">
              {helperText}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="shrink-0 rounded-xl bg-[rgba(71,95,88,0.10)] p-1.5 text-[rgb(var(--brand))] sm:p-2">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
