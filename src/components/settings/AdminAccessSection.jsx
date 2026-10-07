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
export default function AdminAccessSection({ admins, currentUserId, onRevoke }) {
  const [busyId, setBusyId] = useState("");
  const [err, setErr] = useState("");

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
              Who can sign in to this panel. Access is all or nothing, and can
              only be removed here — not granted.
            </p>
          </div>
        </div>

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

    </Card>
  );
}
