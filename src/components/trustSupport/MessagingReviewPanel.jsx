import React from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiMessageSquare, FiEyeOff, FiEye } from "react-icons/fi";
import { formatDate } from "../../utils/formatters.js";

export default function MessagingReviewPanel({ dispute, onHide, onShow }) {
  const messages = dispute?.messages || [];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Messaging Review
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Moderate messages inside the dispute.
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(71,95,88,0.10)] p-2 text-[rgb(var(--brand))]">
          <FiMessageSquare className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {m.author}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{m.text}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(m.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={m.status} />
                  {m.status === "Visible" ? (
                    <Button
                      variant="outline"
                      onClick={() => onHide?.(dispute, m)}
                    >
                      <FiEyeOff className="h-4 w-4" />
                      Hide
                    </Button>
                  ) : (
                    <Button onClick={() => onShow?.(dispute, m)}>
                      <FiEye className="h-4 w-4" />
                      Show
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
