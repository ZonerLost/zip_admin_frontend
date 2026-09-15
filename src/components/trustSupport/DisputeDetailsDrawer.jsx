import React, { useMemo, useState } from "react";
import Drawer from "../shared/Drawer.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import Button from "../shared/Button.jsx";
import DataTable from "../shared/DataTable.jsx";
import Modal from "../shared/Modal.jsx";
import * as bookingsSvc from "../../services/bookingsOperations.service.js";
import * as disputesSvc from "../../services/trustSupport.service.js";
import { formatDate } from "../../utils/formatters.js";
import { FiEdit3 } from "react-icons/fi";

const STATUSES = ["Open", "Investigating", "Resolved", "Rejected"];

export default function DisputeDetailsDrawer({
  open,
  dispute,
  onClose,
  onStatusChange,
  EvidencePanel,
  MessagingPanel,
}) {
  const [status, setStatus] = useState(dispute?.status || "Open");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);

  const [userDisputesOpen, setUserDisputesOpen] = useState(false);
  const [userDisputesRows, setUserDisputesRows] = useState([]);
  const [userDisputesLoading, setUserDisputesLoading] = useState(false);
  const [disputesUser, setDisputesUser] = useState(null);

  React.useEffect(() => {
    setStatus(dispute?.status || "Open");
  }, [dispute]);

  const pendingEvidence = useMemo(() => {
    return (dispute?.evidence || []).filter((e) => e.status === "Pending")
      .length;
  }, [dispute]);

  async function openHistoryFor(userName) {
    setHistoryUser(userName);
    setHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const res = await bookingsSvc.listBookings({
        q: userName,
        page: 1,
        pageSize: 50,
      });
      setHistoryRows(res.rows || []);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function openDisputesFor(userName) {
    setDisputesUser(userName);
    setUserDisputesLoading(true);
    setUserDisputesOpen(true);
    try {
      const res = await disputesSvc.listDisputes({
        q: userName,
        page: 1,
        pageSize: 50,
      });
      setUserDisputesRows(res.rows || []);
    } finally {
      setUserDisputesLoading(false);
    }
  }

  return (
    <Drawer open={open} title="Dispute Details" onClose={onClose}>
      {!dispute ? (
        <p className="text-sm text-slate-500">No dispute selected.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {dispute.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Booking:{" "}
                  <span className="font-medium">{dispute.bookingId}</span> •{" "}
                  {formatDate(dispute.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill value={dispute.priority} />
                <StatusPill value={dispute.status} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Reporter</p>
                <p className="text-sm font-medium text-slate-900">
                  {dispute.reporter}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="text-sm text-sky-600 hover:underline"
                    onClick={() => openHistoryFor(dispute.reporter)}
                  >
                    View booking history
                  </button>
                  <button
                    className="text-sm text-sky-600 hover:underline"
                    onClick={() => openDisputesFor(dispute.reporter)}
                  >
                    View past disputes
                  </button>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Reported User</p>
                <p className="text-sm font-medium text-slate-900">
                  {dispute.reportedUser}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="text-sm text-sky-600 hover:underline"
                    onClick={() => openHistoryFor(dispute.reportedUser)}
                  >
                    View booking history
                  </button>
                  <button
                    className="text-sm text-sky-600 hover:underline"
                    onClick={() => openDisputesFor(dispute.reportedUser)}
                  >
                    View past disputes
                  </button>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Listing</p>
                <p className="text-sm font-medium text-slate-900">
                  {dispute.listingTitle}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Evidence Pending</p>
                <p className="text-sm font-medium text-slate-900">
                  {pendingEvidence}
                </p>
              </div>
            </div>

            {dispute.notes ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">Notes</p>
                <p className="mt-1 text-sm text-slate-700">{dispute.notes}</p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <FiEdit3 className="text-slate-400" />
                <select
                  className="rounded-full border bg-white px-4 py-2 text-sm outline-none focus:border-[rgb(var(--brand))]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Button onClick={() => onStatusChange?.(dispute, status)}>
                Update Status
              </Button>
            </div>
          </div>

          {EvidencePanel ? <EvidencePanel dispute={dispute} /> : null}
          {MessagingPanel ? <MessagingPanel dispute={dispute} /> : null}
        </div>
      )}
      <Modal
        open={historyOpen}
        title={`Booking history — ${historyUser || ""}`}
        onClose={() => setHistoryOpen(false)}
        centered={false}
        footer={null}
      >
        <div className="p-2">
          {historyLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <DataTable
              columns={[
                { key: "id", header: "Booking" },
                { key: "listingTitle", header: "Listing" },
                { key: "startDate", header: "Start" },
                { key: "endDate", header: "End" },
                { key: "status", header: "Status" },
              ]}
              rows={historyRows.map((r) => ({
                ...r,
                startDate: r.startDate
                  ? new Date(r.startDate).toLocaleString()
                  : "",
                endDate: r.endDate ? new Date(r.endDate).toLocaleString() : "",
              }))}
              emptyText="No bookings found for this user."
            />
          )}
        </div>
      </Modal>

      <Modal
        open={userDisputesOpen}
        title={`Past disputes — ${disputesUser || ""}`}
        onClose={() => setUserDisputesOpen(false)}
        centered={false}
        footer={null}
      >
        <div className="p-2">
          {userDisputesLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <DataTable
              columns={[
                { key: "title", header: "Title" },
                { key: "bookingId", header: "Booking" },
                { key: "reportedUser", header: "Reported User" },
                { key: "status", header: "Status" },
                { key: "priority", header: "Priority" },
              ]}
              rows={userDisputesRows}
              emptyText="No disputes found for this user."
            />
          )}
        </div>
      </Modal>
    </Drawer>
  );
}
