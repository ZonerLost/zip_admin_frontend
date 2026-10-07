import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiEye, FiXCircle, FiDollarSign } from "react-icons/fi";


export default function BookingsTable({ rows, onView, onCancel, onRefund, busy }) {
  const columns = useMemo(() => {
    return [
      {
        key: "listingTitle",
        header: "Listing",
        render: (r) => (
          <div className="min-w-50 max-w-80">
            <p className="truncate text-sm font-medium text-neutral-900">
              {r.listingTitle || "-"}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {r.listingCity || ""}
            </p>
            <p className="truncate text-xs text-neutral-500 lg:hidden">
              {r.renterName || ""}
            </p>
          </div>
        ),
      },
      {
        key: "ownerName",
        header: "Owner",
        mobileHidden: true,
        headerClassName: "hidden lg:table-cell",
        cellClassName: "hidden lg:table-cell",
        render: (r) => (
          <div className="min-w-32 max-w-48">
            <p className="truncate text-sm text-neutral-900">
              {r.ownerName || "-"}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {r.ownerEmail || ""}
            </p>
          </div>
        ),
      },
      {
        key: "renterName",
        header: "Renter",
        mobileHidden: true,
        headerClassName: "hidden lg:table-cell",
        cellClassName: "hidden lg:table-cell",
        render: (r) => {
          const name = r.renterName || "";
          const email = r.renterEmail || "";
          const parts = name.split(/\s+/).filter(Boolean);
          let initials = parts
            .slice(0, 2)
            .map((x) => x[0] || "")
            .join("")
            .toUpperCase();
          if (!initials) initials = email[0]?.toUpperCase() || "?";
          return (
            <div className="flex min-w-40 max-w-56 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {name || "-"}
                </p>
                <p className="truncate text-xs text-neutral-500">{email}</p>
              </div>
            </div>
          );
        },
      },
      {
        key: "deliveryMethod",
        header: "Method",
        headerClassName: "hidden md:table-cell",
        cellClassName: "hidden md:table-cell",
        render: (r) => <StatusPill value={r.deliveryMethod || "Unknown"} />,
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <div className="min-w-28">
            <StatusPill value={r.status} />
            {r.refunded ? (
              <p className="mt-1 text-xs text-neutral-500">refunded</p>
            ) : r.isPaid ? (
              <p className="mt-1 text-xs text-green-700">paid</p>
            ) : (
              <p className="mt-1 text-xs text-neutral-400">unpaid</p>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (r) => (
          <span className="whitespace-nowrap text-sm">
            ${Number(r.amount || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => {
          const canRefund = r.isPaid;
          const canCancel = ["Pending", "Approved"].includes(r.status);
          return (
            <div className="flex min-w-32 items-center gap-1">
              <button
                className="rounded-xl p-2 hover:bg-neutral-100"
                onClick={() => onView(r)}
                aria-label="View booking"
                title="View booking"
              >
                <FiEye />
              </button>
              {canRefund ? (
                <button
                  className="rounded-xl p-2 text-neutral-700 hover:bg-neutral-100 disabled:text-neutral-300"
                  onClick={() => onRefund?.(r)}
                  disabled={busy}
                  aria-label="Issue refund"
                  title="Issue refund"
                >
                  <FiDollarSign />
                </button>
              ) : null}

              {canCancel ? (
                <button
                  className="rounded-xl p-2 text-red-700 hover:bg-red-50 disabled:text-neutral-300"
                  onClick={() => onCancel(r)}
                  disabled={busy}
                  aria-label="Cancel booking"
                  title="Cancel booking"
                >
                  <FiXCircle />
                </button>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [onView, onCancel, onRefund, busy]);

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Bookings</p>
          <p className="text-xs text-neutral-500">
            View, cancel and refund. Accepting or declining a request is the
            owner&rsquo;s decision.
          </p>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={rows} emptyText="No bookings." />
      </div>
    </Card>
  );
}
