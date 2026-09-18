import React, { useMemo, useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import Modal from "../shared/Modal.jsx";
import DataTable from "../shared/DataTable.jsx";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function CarbonCategoryMappingTable({
  categories,
  mappings,
  onUpsert,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");
  const [factorKg, setFactorKg] = useState(0);

  const catName = useMemo(() => {
    const map = new Map((categories || []).map((c) => [c.id, c.name]));
    return (id) => map.get(id) || "-";
  }, [categories]);

  function openEdit(row) {
    setCategoryId(row.categoryId);
    setFactorKg(Number(row.factorKg || 0));
    setOpen(true);
  }

  const columns = useMemo(() => {
    return [
      {
        key: "categoryId",
        header: "Category",
        render: (r) => catName(r.categoryId),
      },
      {
        key: "factorKg",
        header: "Factor (kg CO₂)",
        render: (r) => Number(r.factorKg || 0).toFixed(2),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <div className="flex items-center gap-2">
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
  }, [onDelete, catName]);

  async function save() {
    await onUpsert({ categoryId, factorKg: Number(factorKg || 0) });
    setOpen(false);
  }

  return (
    <Card className="p-0">
      <div className="border-b p-4">
        <p className="text-sm font-semibold text-neutral-900">
          Category → CO₂ Mapping
        </p>
        <p className="text-xs text-neutral-500">
          CRUD mapping factors for sustainability calculations.
        </p>
      </div>

      <div className="p-2 sm:p-4">
        <DataTable
          columns={columns}
          rows={mappings || []}
          emptyText="No mapping yet."
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => {
              setCategoryId(categories?.[0]?.id || "");
              setFactorKg(0);
              setOpen(true);
            }}
          >
            Add / Update Mapping
          </Button>
        </div>
      </div>

      <Modal
        open={open}
        title="Mapping Factor"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        }
      >
        <div className="space-y-3">
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
              Factor (kg CO₂)
            </label>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              value={factorKg}
              onChange={(e) => setFactorKg(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
}
