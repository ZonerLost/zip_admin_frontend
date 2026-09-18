import React from "react";
import Card from "./Card.jsx";

export default function SectionCard({ title, subtitle, right, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}
