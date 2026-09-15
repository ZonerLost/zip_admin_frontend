import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";

function formatNotificationType(value) {
  const map = {
    PhotoUploadReminder: "Photo reminder",
    CaseProgressUpdate: "Case update",
    SettingsUpdate: "Settings update",
  };

  return map[value] || value || "-";
}

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
        header: "Type",
        width: "24%",
        render: (r) => (
          <span title={r.type}>
            <StatusPill value={formatNotificationType(r.type)} />
          </span>
        ),
      },
      {
        key: "recipient",
        header: "Recipient",
        width: "18%",
        render: (r) => <span className="whitespace-nowrap">{r.recipient}</span>,
      },
      { key: "channel", header: "Channel", width: "14%" },
      {
        key: "status",
        header: "Status",
        width: "14%",
        render: (r) => <StatusPill value={r.status} />,
      },
      {
        key: "createdAt",
        header: "Time",
        width: "30%",
        render: (r) => {
          const parts = formatNotificationTime(r.createdAt);
          return (
            <div className="leading-5">
              <div className="whitespace-nowrap">{parts.date}</div>
              {parts.time ? (
                <div className="whitespace-nowrap text-xs text-slate-500">
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
        <p className="text-sm font-semibold text-slate-900">
          Notification Logs
        </p>
        <p className="text-xs text-slate-500">
          Audit trail of reminders and updates.
        </p>
      </div>
      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={rows} emptyText="No logs found." />
      </div>
    </Card>
  );
}
