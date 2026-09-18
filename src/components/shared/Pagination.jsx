import React, { useMemo } from "react";
import Button from "./Button.jsx";

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / (pageSize || 1))),
    [total, pageSize]
  );

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-neutral-500">
        Page <span className="font-medium text-neutral-900">{page}</span> of{" "}
        <span className="font-medium text-neutral-900">{pages}</span> • {total}{" "}
        total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={!canPrev}
          onClick={() => onChange(page - 1)}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          disabled={!canNext}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
