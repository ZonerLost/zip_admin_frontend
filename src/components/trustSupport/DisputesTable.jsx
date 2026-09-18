import React, { useMemo, useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import Modal from "../shared/Modal.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { FiEye, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";

const STATUSES = ["Open", "Investigating", "Resolved", "Rejected"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function DisputesTable({
  rows,
  onView,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [reporter, setReporter] = useState("Owner");
  const [reportedUser, setReportedUser] = useState("");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");

  function openCreate() {
    setEditing(null);
    setTitle("");
    setBookingId("");
    setListingTitle("");
    setReporter("Owner");
    setReportedUser("");
    setStatus("Open");
    setPriority("Medium");
    setNotes("");
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setTitle(row.title || "");
    setBookingId(row.bookingId || "");
    setListingTitle(row.listingTitle || "");
    setReporter(row.reporter || "Owner");
    setReportedUser(row.reportedUser || "");
    setStatus(row.status || "Open");
    setPriority(row.priority || "Medium");
    setNotes(row.notes || "");
    setOpen(true);
  }

  const canSave =
    title.trim().length >= 2 &&
    bookingId.trim().length >= 2 &&
    listingTitle.trim().length >= 2 &&
    reportedUser.trim().length >= 2;

  async function save() {
    if (!canSave) return;
    const payload = {
      title,
      bookingId,
      listingTitle,
      reporter,
      reportedUser,
      status,
      priority,
      notes,
    };
    if (!editing) await onCreate(payload);
    else await onUpdate(editing, payload);
    setOpen(false);
  }

  const columns = useMemo(() => {
    return [
      { key: "title", header: "Title" },
      { key: "bookingId", header: "Booking" },
      { key: "reportedUser", header: "User" },
      {
        key: "priority",
        header: "Priority",
        render: (r) => <StatusPill value={r.priority} />,
      },
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
            <button
              className="rounded-xl p-2 hover:bg-neutral-100"
              onClick={() => onView(r)}
              aria-label="View"
            >
              <FiEye />
            </button>
            <button
              className="rounded-xl p-2 hover:bg-neutral-100"
              onClick={() => openEdit(r)}
              aria-label="Edit"
            >
              <FiEdit2 />
            </button>
            <button
              className="rounded-xl p-2 hover:bg-neutral-100"
              onClick={() => onDelete(r)}
              aria-label="Delete"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      },
    ];
  }, [onView, onDelete]);

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Disputes</p>
          <p className="text-xs text-neutral-500">
            CRUD disputes + evidence and message moderation.
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus className="h-4 w-4" />
          New Dispute
        </Button>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable
          columns={columns}
          rows={rows}
          emptyText="No disputes found."
        />
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Dispute" : "Create Dispute"}
        onClose={() => setOpen(false)}
        centered={true}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSave} onClick={save}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-600">Title</label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Damage claim after return"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Booking ID
              </label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="bk_123"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Listing
              </label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                value={listingTitle}
                onChange={(e) => setListingTitle(e.target.value)}
                placeholder="Listing name"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Reporter
              </label>
              <select
                className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
              >
                <option>Owner</option>
                <option>Renter</option>
                <option>System</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Reported User
              </label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                value={reportedUser}
                onChange={(e) => setReportedUser(e.target.value)}
                placeholder="User name"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Priority
              </label>
              <select
                className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">Notes</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
}
