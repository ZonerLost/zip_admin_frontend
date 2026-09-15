import React, { useMemo, useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import Modal from "../shared/Modal.jsx";
import DataTable from "../shared/DataTable.jsx";
import { FiPlus, FiEdit2, FiTrash2, FiShield } from "react-icons/fi";

export default function TeamRolesSection({
  roles,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setPermissions("");
    setOpen(true);
  }

  function openEdit(r) {
    setEditing(r);
    setName(r.name || "");
    setPermissions((r.permissions || []).join(", "));
    setOpen(true);
  }

  const canSave = name.trim().length >= 2;

  async function save() {
    if (!canSave) return;
    const perms = String(permissions || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (!editing) await onCreate({ name, permissions: perms });
    else await onUpdate(editing, { name, permissions: perms });

    setOpen(false);
  }

  const columns = useMemo(() => {
    return [
      { key: "name", header: "Role" },
      {
        key: "permissions",
        header: "Permissions",
        render: (r) => (
          <div className="max-w-90 truncate text-sm text-slate-700">
            {(r.permissions || []).join(", ") || "-"}
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => openEdit(r)}
              aria-label="Edit"
            >
              <FiEdit2 />
            </button>
            <button
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => onDelete(r)}
              aria-label="Delete"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      },
    ];
  }, [onDelete]);

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-[rgba(71,95,88,0.10)] p-2 text-[rgb(var(--brand))]">
            <FiShield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Team Roles</p>
            <p className="text-xs text-slate-500">
              CRUD roles & permissions (admin side).
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <FiPlus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable columns={columns} rows={roles || []} emptyText="No roles." />
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Role" : "Create Role"}
        onClose={() => setOpen(false)}
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
            <label className="text-xs font-medium text-slate-600">
              Role Name
            </label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Support Admin"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Permissions (comma separated)
            </label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              placeholder="disputes.manage, reviews.moderate"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use "*" for full access, or specific permissions for scoped roles.
            </p>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
