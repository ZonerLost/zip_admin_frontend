import React, { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import DataTable from "../shared/DataTable.jsx";
import InsuranceOverrideModal from "./InsuranceOverrideModal.jsx";

export default function InsuranceOverridesTable({
  rows = [],
  items = [],
  plans = [],
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const columns = useMemo(
    () => [
      { key: "itemName", header: "Specific item" },
      {
        key: "scope",
        header: "Scope",
        render: (row) => `${row.categoryName} / ${row.subCategoryName}`,
      },
      {
        key: "inheritedPlans",
        header: "Inherited plans",
        render: (row) => row.inheritedPlans || "-",
      },
      {
        key: "appliedPlans",
        header: "Applied plans",
        render: (row) => row.appliedPlans || "-",
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <>
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => {
                setEditing(row);
                setEditorOpen(true);
              }}
              aria-label="Edit override"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => {
                if (window.confirm(`Delete override for "${row.itemName}"?`)) {
                  onDelete?.(row);
                }
              }}
              aria-label="Delete override"
            >
              <FiTrash2 />
            </button>
          </>
        ),
      },
    ],
    [onDelete],
  );

  async function handleSubmit(payload) {
    if (editing) {
      await onUpdate?.(editing, payload);
    } else {
      await onCreate?.(payload);
    }
    setEditorOpen(false);
    setEditing(null);
  }

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Item Overrides</p>
          <p className="text-xs text-slate-500">
            Specific item rules replace inherited category and sub-category
            insurance plans.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <FiPlus className="h-4 w-4" />
          Add Override
        </Button>
      </div>

      <div className="p-4">
        <DataTable
          columns={columns}
          rows={rows}
          emptyText="No specific item overrides configured."
          paginated
        />
      </div>

      <InsuranceOverrideModal
        open={editorOpen}
        override={editing}
        items={items}
        plans={plans}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
