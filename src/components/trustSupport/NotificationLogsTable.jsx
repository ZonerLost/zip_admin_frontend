import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";

function formatNotificationTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "" };

  return {
    date: new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

export default function NotificationLogsTable({ rows }) {
  const columns = useMemo(() => {
    return [
      {
        key: "type",
        header: "Notification",
        render: (r) => (
          // The service already resolves the label; re-mapping it here was a second copy of the
          // same table that could only drift. The raw type stays available as a tooltip.
          <div className="min-w-44 max-w-72" title={r.rawType || r.type}>
            <StatusPill value={r.type} />
            {r.title ? (
              <p className="mt-1 truncate text-xs text-neutral-500">{r.title}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: "recipient",
        header: "Recipient",
        render: (r) => (
          <div className="min-w-36 max-w-56">
            <p className="truncate text-sm text-neutral-900">{r.recipient}</p>
            {r.recipientEmail ? (
              <p className="truncate text-xs text-neutral-500">
                {r.recipientEmail}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "channel",
        header: "Channel",
        // Only ever "In-app": FCM push is a stub server-side and there is no email or SMS path, so
        // this column says the same thing on every row. Hidden on narrow screens for that reason.
        mobileHidden: true,
        headerClassName: "hidden lg:table-cell",
        cellClassName: "hidden lg:table-cell",
        render: (r) => (
          <span className="whitespace-nowrap text-sm text-neutral-500">
            {r.channel}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => <StatusPill value={r.status} />,
      },
      {
        key: "createdAt",
        header: "Sent",
        render: (r) => {
          const parts = formatNotificationTime(r.createdAt);
          return (
            <div className="leading-5">
              <div className="whitespace-nowrap">{parts.date}</div>
              {parts.time ? (
                <div className="whitespace-nowrap text-xs text-neutral-500">
                  {parts.time}
                </div>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <Card className="p-0">
      <div className="border-b p-4">
        <p className="text-sm font-semibold text-neutral-900">
          Notification Log
        </p>
        <p className="text-xs text-neutral-500">
          Every notification sent on the platform, newest first.
        </p>
      </div>
      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={rows} emptyText="No logs found." />
      </div>
    </Card>
  );
}
