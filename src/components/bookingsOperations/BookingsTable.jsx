import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiCheckCircle, FiEye, FiXCircle, FiDollarSign } from "react-icons/fi";
import Button from "../shared/Button.jsx";

export default function BookingsTable({
  rows,
  onView,
  onApproveReject,
  onCancel,
  onRefund,
}) {
  const columns = useMemo(() => {
    return [
      {
        key: "listingTitle",
        header: "Listing",
        width: "40%",
        render: (r) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {r.listingTitle || r.listing || "-"}
            </p>
            <p className="text-xs text-slate-500">
              {r.listingCity || r.city || r.listingSubtitle || ""}
            </p>
          </div>
        ),
      },
      {
        key: "ownerName",
        header: "Owner",
        width: "15%",
        render: (r) => (
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-900">
              {r.ownerName || r.owner || "-"}
            </p>
          </div>
        ),
      },
      {
        key: "renterName",
        header: "Renter",
        width: "25%",
        render: (r) => {
          const name = r.renterName || r.user || "";
          const email = r.renterEmail || r.email || "";
          const parts = (name || "").split(/\s+/).filter(Boolean);
          let initials = parts
            .slice(0, 2)
            .map((s) => s[0] || "")
            .join("")
            .toUpperCase();
          if (!initials) initials = (email && email[0]?.toUpperCase()) || "?";
          return (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {name || "-"}
                </p>
                <p className="text-xs text-slate-500">{email}</p>
              </div>
            </div>
          );
        },
      },
      {
        key: "deliveryMethod",
        header: "Method",
        width: "10%",
        render: (r) => (
          <StatusPill
            value={r.deliveryMethod || r.method || r.delivery || "Unknown"}
          />
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "10%",
        render: (r) => <StatusPill value={r.status} />,
      },
      {
        key: "amount",
        header: "Amount",
        width: "10%",
        render: (r) => `$${Number(r.amount || 0).toFixed(2)}`,
      },
      {
        key: "refund",
        header: "Refund",
        width: "10%",
        render: (r) =>
          r.refunded ? (
            <StatusPill value="Refunded" />
          ) : (
            <button
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => onRefund?.(r)}
              aria-label="Issue refund"
            >
              <FiDollarSign />
            </button>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => onView(r)}
              aria-label="View"
            >
              <FiEye />
            </button>

            {r.status === "Pending" ? (
              <button
                className="rounded-xl p-2 hover:bg-slate-100"
                onClick={() => onApproveReject(r)}
                aria-label="Approve/Reject"
              >
                <FiCheckCircle />
              </button>
            ) : null}

            {r.status !== "Cancelled" ? (
              <button
                className="rounded-xl p-2 hover:bg-slate-100"
                onClick={() => onCancel(r)}
                aria-label="Cancel"
              >
                <FiXCircle />
              </button>
            ) : null}
          </div>
        ),
      },
    ];
  }, [onView, onApproveReject, onCancel, onRefund]);

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Bookings</p>
          <p className="text-xs text-slate-500">
            Approve, reject, cancel — clean operations flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              /* reserved */
            }}
          >
            Quick tools
          </Button>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={rows} />
      </div>
    </Card>
  );
}
