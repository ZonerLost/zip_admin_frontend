import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiRefreshCw } from "react-icons/fi";

/**
 * Transactions, with refunding done per row.
 *
 * There used to be a single "Create Refund" button in the header, which opened a form asking an
 * administrator to type a booking id by hand (placeholder: `bk_123`, while real ids are 24-character
 * hex). Refunding is an action against one specific payment, so it belongs on that payment's row —
 * nobody should be copying an object id to move money.
 */
export default function TransactionsTable({ rows, onRefund, busyId }) {
  const columns = useMemo(() => {
    return [
      {
        key: "bookingId",
        header: "Booking",
        render: (r) => (
          <span
            className="block max-w-40 truncate font-mono text-xs text-neutral-600"
            title={r.bookingId}
          >
            {r.bookingId}
          </span>
        ),
      },
      {
        key: "user",
        header: "Paid by",
        render: (r) => (
          <div className="min-w-32 max-w-48">
            <p className="truncate text-sm text-neutral-900">{r.user}</p>
            {r.payeeName && r.payeeName !== "—" ? (
              <p className="truncate text-xs text-neutral-500">
                to {r.payeeName}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        mobileHidden: true,
        headerClassName: "hidden md:table-cell",
        cellClassName: "hidden md:table-cell",
        render: (r) => <StatusPill value={r.type} />,
      },
      {
        key: "status",
        header: "Status",
        render: (r) => <StatusPill value={r.status} />,
      },
      {
        key: "amount",
        header: "Amount",
        render: (r) => (
          <span className="whitespace-nowrap text-sm">
            ${Number(r.amount || 0).toFixed(2)} {r.currency}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => {
          if (r.isRefunded) {
            return (
              <span className="whitespace-nowrap text-xs text-neutral-500">
                refunded
              </span>
            );
          }
          // Only a completed payment can be refunded; the server refuses the rest, so showing the
          // button on a pending or failed row would only produce an error.
          if (!r.canRefund) {
            return <span className="text-xs text-neutral-400">—</span>;
          }
          return (
            <button
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
              onClick={() => onRefund?.(r)}
              disabled={busyId === r.id}
              title="Refund this payment"
            >
              <FiRefreshCw className="h-4 w-4" />
              {busyId === r.id ? "Refunding..." : "Refund"}
            </button>
          );
        },
      },
    ];
  }, [onRefund, busyId]);

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Transactions</p>
          <p className="text-xs text-neutral-500">
            Charges and refunds. Refund a payment from its own row.
          </p>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={rows} emptyText="No transactions." />
      </div>
    </Card>
  );
}
