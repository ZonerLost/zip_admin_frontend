import React, { useCallback, useMemo, useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import Modal from "../shared/Modal.jsx";
import DataTable from "../shared/DataTable.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import {
  FiEdit2,
  FiEye,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiStar,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";

function ListingsActionsMenu({
  row,
  onView,
  onEdit,
  onToggleFeatured,
  onDelete,
}) {
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
            <FiEye className="h-4 w-4" /> View
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
              onToggleFeatured(row);
            }}
          >
            {row.featured ? (
              <>
                <AiFillStar className="h-4 w-4 text-brand" />{" "}
                Unfeature
              </>
            ) : (
              <>
                <FiStar className="h-4 w-4" /> Feature
              </>
            )}
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

const STATUSES = ["Active", "Paused", "Unlisted"];

export default function ListingsTable({
  rows,
  categories,
  loading = false,
  onView,
  onCreate,
  onUpdate,
  onDelete,
  onToggleFeatured,
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");
  const [status, setStatus] = useState("Paused");
  const [featured, setFeatured] = useState(false);
  const [co2Kg, setCo2Kg] = useState(0);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setOwner("");
    setCity("");
    setCategoryId(categories?.[0]?.id || "");
    setStatus("Paused");
    setFeatured(false);
    setCo2Kg(0);
    setEditorOpen(true);
  }

  const openEdit = useCallback(
    (item) => {
      setEditing(item);
      setTitle(item.title || "");
      setOwner(item.owner || "");
      setCity(item.city || "");
      setCategoryId(item.categoryId || categories?.[0]?.id || "");
      setStatus(item.status || "Paused");
      setFeatured(Boolean(item.featured));
      setCo2Kg(Number(item.co2Kg || 0));
      setEditorOpen(true);
    },
    [categories],
  );

  const canSave =
    title.trim().length >= 2 &&
    owner.trim().length >= 2 &&
    city.trim().length >= 2 &&
    String(categoryId || "").length > 0;

  async function save() {
    if (!canSave) return;

    const payload = {
      title,
      owner,
      city,
      categoryId,
      status,
      featured,
      co2Kg: Number(co2Kg || 0),
    };

    if (!editing) await onCreate(payload);
    else await onUpdate(editing, payload);

    setEditorOpen(false);
  }

  const categoryName = useMemo(() => {
    const map = new Map((categories || []).map((c) => [c.id, c.name]));
    return (id) => map.get(id) || "-";
  }, [categories]);

  const columns = useMemo(() => {
    return [
      { key: "title", header: "Title" },
      { key: "owner", header: "Owner" },
      { key: "city", header: "City" },
      {
        key: "categoryId",
        header: "Category",
        render: (r) => categoryName(r.categoryId),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => <StatusPill value={r.status} />,
      },
      {
        key: "featured",
        header: "Featured",
        render: (r) => (
          <StatusPill value={r.featured ? "Featured" : "Normal"} />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <ListingsActionsMenu
            row={r}
            onView={onView}
            onEdit={openEdit}
            onToggleFeatured={onToggleFeatured}
            onDelete={onDelete}
          />
        ),
      },
    ];
  }, [onView, onDelete, onToggleFeatured, categoryName, openEdit]);

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Listings</p>
          <p className="text-xs text-neutral-500">
            CRUD + moderation-friendly actions.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button onClick={openCreate}>
            <FiPlus className="h-4 w-4" />
            Add Listing
          </Button>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        {loading ? (
          <div className="rounded-2xl border bg-white px-4 py-6 text-sm text-neutral-500">
            Updating listings...
          </div>
        ) : (
          <DataTable columns={columns} rows={Array.isArray(rows) ? rows : []} />
        )}
      </div>

      <Modal
        open={editorOpen}
        title={editing ? "Edit Listing" : "Add Listing"}
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
            <label className="text-xs font-medium text-neutral-600">Title</label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Listing title"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Owner
              </label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Owner name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">City</label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Category
              </label>
              <select
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border bg-white p-4">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">Featured</p>
                <p className="text-xs text-neutral-500">
                  Boost listing visibility.
                </p>
              </div>
            </label>

            <div>
              <label className="text-xs font-medium text-neutral-600">
                CO₂ (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
                value={co2Kg}
                onChange={(e) => setCo2Kg(e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
