import React from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiImage, FiCheck, FiX } from "react-icons/fi";

export default function EvidenceReviewPanel({ dispute, onApprove, onReject }) {
  const evidence = dispute?.evidence || [];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Evidence Review
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Approve/reject uploaded evidence.
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(71,95,88,0.10)] p-2 text-[rgb(var(--brand))]">
          <FiImage className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {evidence.length === 0 ? (
          <p className="text-sm text-slate-500">No evidence uploaded.</p>
        ) : (
          evidence.map((e) => (
            <div key={e.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {e.label}
                  </p>
                  <p className="text-xs text-slate-500">{e.type}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={e.status} />
                  {e.status === "Pending" ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onReject?.(dispute, e)}
                      >
                        <FiX className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button onClick={() => onApprove?.(dispute, e)}>
                        <FiCheck className="h-4 w-4" />
                        Approve
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                Evidence preview placeholder (connect to storage URLs later).
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
