import React, { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import DataTable from "../shared/DataTable.jsx";
import InsurancePlanModal from "./InsurancePlanModal.jsx";

function formatPricing(plan) {
  if (plan.pricingType === "percentage") {
    return `${Number(plan.priceValue || 0).toFixed(2)}%`;
  }
  if (plan.pricingType === "fixed_amount_per_day") {
    return `$${Number(plan.priceValue || 0).toFixed(2)} / day`;
  }
  return `$${Number(plan.priceValue || 0).toFixed(2)} fixed`;
}

export default function InsurancePlansTable({
  plans = [],
  options,
  overrideRows = [],
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const categoryNameById = useMemo(
    () =>
      new Map((options?.categories || []).map((item) => [item.id, item.name])),
    [options],
  );
  const subCategoryNameById = useMemo(
    () =>
      new Map(
        (options?.subCategories || []).map((item) => [item.id, item.name]),
      ),
    [options],
  );

  const overrideCountByPlan = useMemo(() => {
    const map = new Map();
    overrideRows.forEach((row) => {
      (row.planIds || []).forEach((planId) => {
        map.set(planId, (map.get(planId) || 0) + 1);
      });
    });
    return map;
  }, [overrideRows]);

  const columns = useMemo(
    () => [
      { key: "name", header: "Plan" },
      { key: "description", header: "Description" },
      {
        key: "pricing",
        header: "Pricing",
        render: (row) => formatPricing(row),
      },
      {
        key: "categories",
        header: "Categories",
        render: (row) =>
          row.categoryIds.length
            ? row.categoryIds
                .map((id) => categoryNameById.get(id))
                .filter(Boolean)
                .join(", ")
            : "-",
      },
      {
        key: "subCategories",
        header: "Sub-categories",
        render: (row) =>
          row.subCategoryIds.length
            ? row.subCategoryIds
                .map((id) => subCategoryNameById.get(id))
                .filter(Boolean)
                .join(", ")
            : "-",
      },
      {
        key: "overrideCount",
        header: "Specific item overrides",
        render: (row) => overrideCountByPlan.get(row.id) || 0,
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
              aria-label="Edit plan"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-slate-100"
              onClick={() => {
                if (window.confirm(`Delete insurance plan "${row.name}"?`)) {
                  onDelete?.(row);
                }
              }}
              aria-label="Delete plan"
            >
              <FiTrash2 />
            </button>
          </>
        ),
      },
    ],
    [categoryNameById, onDelete, overrideCountByPlan, subCategoryNameById],
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
          <p className="text-sm font-semibold text-slate-900">Insurance Plans</p>
          <p className="text-xs text-slate-500">
            Create, price, and assign insurance plans by category and
            sub-category.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <FiPlus className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <div className="p-4">
        <DataTable
          columns={columns}
          rows={plans}
          emptyText="No insurance plans configured."
          paginated
        />
      </div>

      <InsurancePlanModal
        open={editorOpen}
        plan={editing}
        options={options}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
