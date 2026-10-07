import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import DataTable from "../shared/DataTable.jsx";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import Modal from "../shared/Modal.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import {
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiMoreVertical,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import * as usersService from "../../services/users.service.js";

function ActionsMenu({ row, onView, onEdit, onVerify, onDelete, onReactivate }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isDeactivated = row.status === "Deactivated" || row.isActive === false;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="rounded-xl p-2 hover:bg-neutral-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="More actions"
      >
        <FiMoreVertical />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-2xl border bg-white shadow-lg py-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onView(row);
            }}
          >
            <FiEye className="h-4 w-4" /> View Details
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onEdit(row);
            }}
          >
            <FiEdit2 className="h-4 w-4" /> Edit
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onVerify(row);
            }}
          >
            <FiUserCheck className="h-4 w-4" />{" "}
            {row.identityVerified ? "Revoke ID" : "Verify ID"}
          </button>
          {isDeactivated ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onReactivate?.(row);
              }}
            >
              <FiCheckCircle className="h-4 w-4" /> Reactivate
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onDelete(row);
              }}
            >
              <FiTrash2 className="h-4 w-4" /> Deactivate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function UsersTable({
  rows,
  onView,
  onCreate: _onCreate, // no admin signup endpoint; the create path is gone
  onUpdate,
  onDelete,
  onReactivate,
  onVerify,
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  // Editable: name, phone, role. Email is shown read-only. The rest of what this editor used to
  // hold — status, acts-as, listings/bookings counts, last active — is either derived server-side or
  // changed through a different action entirely, so it is not state here any more.
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function openEdit(user) {
    setEditing(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setSaveError("");
    setEditorOpen(true);
  }

  const columns = useMemo(() => {
    return [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      {
        key: "role",
        header: "Role",
        render: (r) => (r.isOwner ? "Owner" : "Renter"),
      },
      {
        key: "listingsCount",
        header: "Listings",
        render: (r) => r.listingsCount ?? 0,
      },
      {
        key: "bookingsCount",
        header: "Bookings",
        render: (r) => r.bookingsCount ?? 0,
      },
      {
        key: "lastActive",
        header: "Last Active",
        render: (r) =>
          r.lastActive ? new Date(r.lastActive).toLocaleDateString() : "—",
      },
      {
        key: "status",
        header: "Status",
        render: (r) => <StatusPill value={r.status} />,
      },
      {
        key: "verified",
        header: "Verification",
        render: (r) => (
          // Two separate facts, and the Verify action controls the second one. This column used to
          // show only the email flag, so approving an identity changed nothing visible here and the
          // action looked broken.
          <div className="min-w-28 space-y-1">
            <StatusPill
              value={r.identityVerified ? "ID verified" : "ID not verified"}
            />
            <p className="text-xs text-neutral-500">
              {r.emailVerified ? "email verified" : "email unverified"}
            </p>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <ActionsMenu
            row={r}
            onView={onView}
            onEdit={openEdit}
            onVerify={onVerify}
            onDelete={onDelete}
            onReactivate={onReactivate}
          />
        ),
      },
    ];
  }, [onView, onDelete, onVerify, onReactivate]);

  // Whatever the server returned, including nothing. There used to be a MOCK_USERS fallback here:
  // an empty or failed list silently rendered five invented people — Alice Johnson, Bob Martin and
  // friends — with ids 1 to 5, which every row action would then have been fired against. An empty
  // table is the truth; a fake one is a trap.
  // Memoised because an effect below depends on it; a new array each render re-ran that effect.
  const displayRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const [filteredRows, setFilteredRows] = useState(displayRows);

  // show/hide the filter modal (mobile-friendly)
  const [filterOpen, setFilterOpen] = useState(false);

  // filter state (table-level) - initialize from persisted localStorage when possible
  const [roleFilter, setRoleFilter] = useState(() => {
    try {
      const raw = localStorage.getItem("usersTableFilters");
      const p = raw ? JSON.parse(raw) : null;
      return p?.roleFilter ?? "all";
    } catch {
      return "all";
    }
  });
  const [inactiveMonths, setInactiveMonths] = useState(() => {
    try {
      const raw = localStorage.getItem("usersTableFilters");
      const p = raw ? JSON.parse(raw) : null;
      return p?.inactiveMonths ?? 0;
    } catch {
      return 0;
    }
  });
  const [minListings, setMinListings] = useState(() => {
    try {
      const raw = localStorage.getItem("usersTableFilters");
      const p = raw ? JSON.parse(raw) : null;
      return p?.minListings ?? 0;
    } catch {
      return 0;
    }
  });
  const [minBookings, setMinBookings] = useState(() => {
    try {
      const raw = localStorage.getItem("usersTableFilters");
      const p = raw ? JSON.parse(raw) : null;
      return p?.minBookings ?? 0;
    } catch {
      return 0;
    }
  });

  // Email is no longer edited here, so it is no longer gated on.
  const canSave = name.trim().length >= 2;

  // apply filters server-side via the users service and persist them
  async function applyFilters() {
    const params = {
      q: "",
      page: 1,
      pageSize: 10000,
      role: roleFilter === "all" ? null : roleFilter,
      minListings: minListings > 0 ? minListings : null,
      minBookings: minBookings > 0 ? minBookings : null,
      inactiveMonths: inactiveMonths > 0 ? inactiveMonths : null,
    };

    try {
      const res = await usersService.list(params);
      const rowsFromServer = res.rows || [];
      setFilteredRows(rowsFromServer);
      // persist filters so they survive navigation/refresh
      try {
        localStorage.setItem(
          "usersTableFilters",
          JSON.stringify({
            roleFilter,
            inactiveMonths,
            minListings,
            minBookings,
          }),
        );
      } catch {
        /* ignore */
      }
    } catch {
      // fallback to client-side filtering if service fails
      let out = Array.isArray(displayRows) ? displayRows.slice() : [];
      if (roleFilter === "owner") out = out.filter((u) => u.isOwner);
      else if (roleFilter === "renter") out = out.filter((u) => !u.isOwner);
      if (minListings > 0)
        out = out.filter((u) => (u.listingsCount || 0) >= minListings);
      if (minBookings > 0)
        out = out.filter((u) => (u.bookingsCount || 0) >= minBookings);
      if (inactiveMonths > 0) {
        const cutoff = Date.now() - inactiveMonths * 30 * 24 * 60 * 60 * 1000;
        out = out.filter((u) => {
          const last = u.lastActive ? new Date(u.lastActive).getTime() : 0;
          return last <= cutoff;
        });
      }
      setFilteredRows(out);
    }
    setFilterOpen(false);
  }

  function resetFilters() {
    setRoleFilter("all");
    setInactiveMonths(0);
    setMinListings(0);
    setMinBookings(0);
    setFilteredRows(displayRows);
    toast.success("Filters reset to default");
    try {
      localStorage.removeItem("usersTableFilters");
    } catch {
      /* ignore */
    }
  }

  async function exportFiltered() {
    const tid = toast.loading("Generating users export...");
    try {
      const res = await usersService.list({
        q: "",
        page: 1,
        pageSize: 10000,
        role: roleFilter === "all" ? null : roleFilter,
        minListings: minListings > 0 ? minListings : null,
        minBookings: minBookings > 0 ? minBookings : null,
        inactiveMonths: inactiveMonths > 0 ? inactiveMonths : null,
      });
      const rowsToExport = res.rows || [];
      const headers = [
        "id",
        "name",
        "email",
        "status",
        "verified",
        "isOwner",
        "listingsCount",
        "bookingsCount",
        "lastActive",
      ];
      const csv = [headers.join(",")]
        .concat(
          rowsToExport.map((r) =>
            headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
          ),
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Users exported successfully", { id: tid });
    } catch (e) {
      toast.error(e?.message || "Failed to export users", { id: tid });
    }
  }

  async function save() {
    if (!canSave || !editing) return;

    // Only what the server can save. The rest of what this form used to send was either derived
    // (isOwner, listingsCount and bookingsCount come from the user's history arrays; lastActive
    // from lastLoginAt) or refused outright (email is the login identity; status is changed by
    // banning, not by editing a string). Sending them achieved nothing and implied otherwise.
    //
    // The create branch is gone with them: there is no admin signup endpoint, the button was already
    // removed, and the service throws. Editing is the only path in here.
    setSaveError("");
    setSaving(true);
    try {
      await onUpdate(editing, { name, phone });
      setEditorOpen(false);
    } catch (e) {
      // Role changes can legitimately be refused — self-demotion and removing the last admin are
      // both blocked server-side — so the dialog stays open with the reason.
      setSaveError(e?.message || "Those changes could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  // fetch filtered rows whenever filters or displayRows change
  useEffect(() => {
    const hasActiveFilters =
      roleFilter !== "all" ||
      inactiveMonths > 0 ||
      minListings > 0 ||
      minBookings > 0;

    if (!hasActiveFilters) {
      setFilteredRows(displayRows);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await usersService.list({
          q: "",
          page: 1,
          pageSize: 10000,
          role: roleFilter === "all" ? null : roleFilter,
          minListings: minListings > 0 ? minListings : null,
          minBookings: minBookings > 0 ? minBookings : null,
          inactiveMonths: inactiveMonths > 0 ? inactiveMonths : null,
        });
        if (!mounted) return;
        setFilteredRows(res.rows || []);
      } catch {
        if (!mounted) return;
        setFilteredRows(displayRows);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [roleFilter, inactiveMonths, minListings, minBookings, displayRows]);

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Users</p>
          <p className="text-xs text-neutral-500">
            Create, edit, verify, and manage users (CRUD).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border px-3 py-2 text-sm"
            onClick={() => setFilterOpen(true)}
          >
            Filters
          </button>

          <button
            type="button"
            className="ml-2 rounded-full bg-brand px-3 py-2 text-white text-sm"
            onClick={exportFiltered}
          >
            Export filtered
          </button>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={filteredRows} />
      </div>

      <Modal
        open={filterOpen}
        title="Filters"
        onClose={() => setFilterOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetFilters();
                setFilterOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                exportFiltered();
              }}
            >
              Export
            </Button>
            <Button onClick={applyFilters}>Apply</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-500">Role</label>
            <select
              className="mt-1 w-full rounded-2xl border px-3 py-2 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="owner">Owners</option>
              <option value="renter">Renters</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-neutral-500">Inactive (months)</label>
            <input
              type="number"
              min={0}
              className="w-24 rounded-2xl border px-3 py-2 text-sm"
              value={inactiveMonths}
              onChange={(e) => setInactiveMonths(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-500">Min Listings</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
                value={minListings}
                onChange={(e) => setMinListings(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500">Min Bookings</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
                value={minBookings}
                onChange={(e) => setMinBookings(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={editorOpen}
        title="Edit User"
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSave || saving} onClick={save}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {saveError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {saveError}
            </div>
          ) : null}

          <div>
            <label className="text-xs font-medium text-neutral-600">Name</label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">Phone</label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 0100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">Email</label>
            <input
              className="mt-1 w-full cursor-not-allowed rounded-2xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-500 outline-none"
              value={email}
              readOnly
              disabled
            />
            <p className="mt-1 text-xs text-neutral-500">
              Read-only. The email is the sign-in identity and carries a
              verification state, so changing it for someone would lock them out
              while still claiming the new address was confirmed. Users change
              it themselves, with verification.
            </p>
          </div>

          {/* The System Role select is gone: it was a second, quieter way to hand out full admin
              access from a dropdown in an edit form. Admin access is removed from the user details
              panel and granted nowhere in the UI. */}

          {/* Acts-as, last active, listings and bookings counts were editable inputs here. All four
              are derived server-side from the user's own activity, so typing a number changed
              nothing — they are facts about the account, shown in the details panel. */}
        </div>
      </Modal>
    </Card>
  );
}
