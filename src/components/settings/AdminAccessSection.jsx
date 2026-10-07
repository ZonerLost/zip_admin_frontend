import React, { useMemo, useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import Modal from "../shared/Modal.jsx";
import DataTable from "../shared/DataTable.jsx";
import { FiPlus, FiShield, FiUserMinus } from "react-icons/fi";

/**
 * Who can reach the admin panel.
 *
 * This replaces a "Team Roles — CRUD roles & permissions" screen that was entirely fictional: three
 * invented roles with made-up permission strings, stored in localStorage, granting nothing. The
 * backend models access as one field on the user — `role: "user" | "admin"` — so that is what this
 * shows and changes. There is nothing finer-grained to offer, and pretending otherwise is worse than
 * offering less.
 */
export default function AdminAccessSection({
  admins,
  currentUserId,
  onSearch,
  onGrant,
  onRevoke,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [err, setErr] = useState("");

  async function runSearch(next) {
    setQuery(next);
    setErr("");
    if (next.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      setResults(await onSearch(next));
    } catch (e) {
      setErr(e?.message || "Search failed.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function grant(user) {
    setErr("");
    setBusyId(user.id);
    try {
      await onGrant(user);
      setOpen(false);
      setQuery("");
      setResults([]);
    } catch (e) {
      setErr(e?.message || "Could not grant admin access.");
    } finally {
      setBusyId("");
    }
  }

  async function revoke(user) {
    setErr("");
    setBusyId(user.id);
    try {
      await onRevoke(user);
    } catch (e) {
      setErr(e?.message || "Could not revoke admin access.");
    } finally {
      setBusyId("");
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Admin",
        render: (u) => (
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {u.name}
              {u.id === currentUserId ? (
                <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">
                  you
                </span>
              ) : null}
            </p>
            <p className="text-xs text-neutral-500">{u.email}</p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (u) =>
          u.isBanned ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
              banned
            </span>
          ) : (
            <span className="text-xs text-neutral-500">active</span>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (u) => {
          // Blocked in the UI as well as on the server: removing your own access locks you out, and
          // the fix is a database edit. The server refuses it too, and also refuses removing the
          // last admin — this just stops the common mistake becoming a round trip.
          const isSelf = u.id === currentUserId;
          return (
            <button
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
              onClick={() => revoke(u)}
              disabled={isSelf || busyId === u.id}
              title={
                isSelf
                  ? "You cannot remove your own admin access"
                  : "Remove admin access"
              }
            >
              <FiUserMinus className="h-4 w-4" />
              {busyId === u.id ? "Removing..." : "Remove admin"}
            </button>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, busyId],
  );

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-brand-soft p-2 text-brand">
            <FiShield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Admin Access
            </p>
            <p className="text-xs text-neutral-500">
              Who can sign in to this panel. Access is all or nothing — there
              are no scoped permissions.
            </p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>
          <FiPlus className="h-4 w-4" />
          Grant Admin
        </Button>
      </div>

      {err ? (
        <div className="border-b bg-red-50 px-4 py-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="p-2 sm:p-4">
        <DataTable
          columns={columns}
          rows={admins || []}
          emptyText="No admins found."
        />
      </div>

      <Modal
        open={open}
        title="Grant Admin Access"
        onClose={() => {
          setOpen(false);
          setQuery("");
          setResults([]);
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setQuery("");
                setResults([]);
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-600">
              Find a user by name or email
            </label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={query}
              onChange={(e) => runSearch(e.target.value)}
              placeholder="at least 2 characters"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Granting admin gives full access to every module, including
              refunds and user deletion.
            </p>
          </div>

          {searching ? (
            <p className="text-sm text-neutral-500">Searching...</p>
          ) : null}

          {!searching && query.trim().length >= 2 && results.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No matching users who are not already admins.
            </p>
          ) : null}

          <div className="space-y-2">
            {results.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-2xl border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-neutral-500">{u.email}</p>
                </div>
                <Button
                  disabled={busyId === u.id}
                  onClick={() => grant(u)}
                >
                  {busyId === u.id ? "Granting..." : "Make admin"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </Card>
  );
}
