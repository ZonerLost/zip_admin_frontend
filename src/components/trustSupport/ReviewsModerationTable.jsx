import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiEyeOff, FiEye, FiTrash2 } from "react-icons/fi";

export default function ReviewsModerationTable({
  rows,
  onHide,
  onShow,
  onRemove,
}) {
  const columns = useMemo(() => {
    return [
      { key: "listingTitle", header: "Listing" },
      { key: "author", header: "Author" },
      { key: "rating", header: "Rating" },
      {
        key: "status",
        header: "Status",
        render: (r) => <StatusPill value={r.status} />,
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <div className="flex items-center gap-2">
            {r.status === "Visible" ? (
              <button
                className="rounded-xl p-2 hover:bg-slate-100"
                onClick={() => onHide(r)}
                aria-label="Hide"
              >
                <FiEyeOff />
              </button>
            ) : (
              <button
                className="rounded-xl p-2 hover:bg-slate-100"
                onClick={() => onShow(r)}
                aria-label="Show"
              >
                <FiEye />
              </button>
            )}
            <button
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => onRemove(r)}
              aria-label="Remove"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      },
    ];
  }, [onHide, onShow, onRemove]);

  return (
    <Card className="p-0">
      <div className="border-b p-4">
        <p className="text-sm font-semibold text-slate-900">
          Reviews Moderation
        </p>
        <p className="text-xs text-slate-500">
          Hide or remove toxic content professionally.
        </p>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable
          columns={columns}
          rows={rows}
          emptyText="No reviews found."
        />
      </div>
    </Card>
  );
}
