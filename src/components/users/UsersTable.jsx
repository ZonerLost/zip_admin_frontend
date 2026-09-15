import React, { useMemo, useState, useEffect } from "react";
import DataTable from "../shared/DataTable.jsx";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import Modal from "../shared/Modal.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import {
  FiEdit2,
  FiEye,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import { isEmail } from "../../utils/validators.js";
import * as usersService from "../../services/users.service.js";

function ActionsMenu({ row, onView, onEdit, onVerify, onDelete }) {
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

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="rounded-xl p-2 hover:bg-slate-100"
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
        <div className="absolute right-0 z-50 mt-1 w-40 rounded-2xl border bg-white shadow-lg py-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onView(row);
            }}
          >
            <FiEye className="h-4 w-4" /> View
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
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
            className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onVerify(row);
            }}
          >
            <FiUserCheck className="h-4 w-4" /> Verify
          </button>
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
            <FiTrash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

const MOCK_USERS = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    status: "Active",
    verified: true,
  },
  {
    id: 2,
    name: "Bob Martin",
    email: "bob.martin@example.com",
    status: "Active",
    verified: false,
  },
  {
    id: 3,
    name: "Carla Gomez",
    email: "carla.gomez@example.com",
    status: "Pending",
    verified: false,
  },
  {
    id: 4,
    name: "Daniel Wu",
    email: "daniel.wu@example.com",
    status: "Disabled",
    verified: true,
  },
  {
    id: 5,
    name: "Eve Thompson",
    email: "eve.thompson@example.com",
    status: "Active",
    verified: true,
  },
];

export default function UsersTable({
  rows,
  onView,
  onCreate,
  onUpdate,
  onDelete,
  onVerify,
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active");
  const [systemRole, setSystemRole] = useState("user");
  const [isOwner, setIsOwner] = useState(false);
  const [listingsCount, setListingsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [lastActive, setLastActive] = useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setStatus("Active");
    setSystemRole("user");
    setIsOwner(false);
    setListingsCount(0);
    setBookingsCount(0);
    setLastActive("");
    setEditorOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setStatus(user.status || "Active");
    setSystemRole(user.role ?? "user");
    setIsOwner(Boolean(user.isOwner));
    setListingsCount(user.listingsCount ?? 0);
    setBookingsCount(user.bookingsCount ?? 0);
    setLastActive(
      user.lastActive
        ? new Date(user.lastActive).toISOString().slice(0, 10)
        : "",
    );
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
          <StatusPill value={r.verified ? "Verified" : "Unverified"} />
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
          />
        ),
      },
    ];
  }, [onView, onDelete, onVerify]);

  const displayRows = Array.isArray(rows) && rows.length ? rows : MOCK_USERS;
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

  const canSave = name.trim().length >= 2 && isEmail(email);

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
    try {
      localStorage.removeItem("usersTableFilters");
    } catch {
      /* ignore */
    }
  }

  async function exportFiltered() {
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
  }

  async function save() {
    if (!canSave) return;
    if (!editing) {
      await onCreate({
        name,
        email,
        status,
        isOwner,
        listingsCount: Number(listingsCount),
        bookingsCount: Number(bookingsCount),
        lastActive: lastActive ? new Date(lastActive).toISOString() : null,
      });
    } else {
      await onUpdate(editing, {
        name,
        email,
        status,
        role: systemRole,
        isOwner,
        listingsCount: Number(listingsCount),
        bookingsCount: Number(bookingsCount),
        lastActive: lastActive ? new Date(lastActive).toISOString() : null,
      });
    }
    setEditorOpen(false);
  }

  // fetch filtered rows whenever filters or displayRows change
  useEffect(() => {
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
          <p className="text-sm font-semibold text-slate-900">Users</p>
          <p className="text-xs text-slate-500">
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
            className="ml-2 rounded-full bg-[rgb(var(--brand))] px-3 py-2 text-white text-sm"
            onClick={exportFiltered}
          >
            Export filtered
          </button>

          <Button type="button" onClick={openCreate}>
            <FiPlus className="h-4 w-4" />
            Add User
          </Button>
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
            <label className="text-xs text-slate-500">Role</label>
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
            <label className="text-xs text-slate-500">Inactive (months)</label>
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
              <label className="text-xs text-slate-500">Min Listings</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
                value={minListings}
                onChange={(e) => setMinListings(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">Min Bookings</label>
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
        title={editing ? "Edit User" : "Add User"}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
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
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
            {!isEmail(email) && email.length > 0 ? (
              <p className="mt-1 text-xs text-rose-600">
                Please enter a valid email.
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Active</option>
              <option>Disabled</option>
              <option>Pending</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">System Role</label>
            <select
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)]"
              value={systemRole}
              onChange={(e) => setSystemRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Role</label>
              <select
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
                value={isOwner ? "owner" : "renter"}
                onChange={(e) => setIsOwner(e.target.value === "owner")}
              >
                <option value="renter">Renter</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Last Active
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
                value={lastActive}
                onChange={(e) => setLastActive(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Listings Count
              </label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
                value={listingsCount}
                onChange={(e) => setListingsCount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Bookings Count
              </label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
                value={bookingsCount}
                onChange={(e) => setBookingsCount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
