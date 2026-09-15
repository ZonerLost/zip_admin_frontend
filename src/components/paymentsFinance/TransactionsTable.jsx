import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiRefreshCw } from "react-icons/fi";
import Button from "../shared/Button.jsx";

export default function TransactionsTable({ rows, onRefund }) {
  const columns = useMemo(() => {
    return [
      { key: "bookingId", header: "Booking" },
      { key: "user", header: "User" },
      {
        key: "type",
        header: "Type",
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
        render: (r) => `$${Number(r.amount || 0).toFixed(2)}`,
      },
    ];
  }, []);

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Transactions</p>
          <p className="text-xs text-slate-500">
            Charges, fees, payouts and refunds.
          </p>
        </div>
        <Button onClick={onRefund}>
          <FiRefreshCw className="h-4 w-4" />
          Create Refund
        </Button>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={rows} />
      </div>
    </Card>
  );
}
