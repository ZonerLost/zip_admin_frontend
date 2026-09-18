import React, { useEffect, useMemo, useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

function toggleId(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export default function InsurancePlanModal({
  open = false,
  plan = null,
  options,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricingType, setPricingType] = useState("percentage");
  const [priceValue, setPriceValue] = useState(0);
  const [categoryIds, setCategoryIds] = useState([]);
  const [subCategoryIds, setSubCategoryIds] = useState([]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(plan?.name || "");
    setDescription(plan?.description || "");
    setPricingType(plan?.pricingType || "percentage");
    setPriceValue(Number(plan?.priceValue || 0));
    setCategoryIds(plan?.categoryIds || []);
    setSubCategoryIds(plan?.subCategoryIds || []);
  }, [open, plan]);

  const canSave =
    name.trim().length >= 2 &&
    description.trim().length >= 8 &&
    Number(priceValue) > 0;

  const pricingHelp = useMemo(() => {
    if (pricingType === "percentage")
      return "Example: 10 means 10% of rental price";
    if (pricingType === "fixed_amount_per_day") {
      return "Example: 1.50 means $1.50 per rental day";
    }
    return "Example: 4.99 means a fixed insurance fee per booking";
  }, [pricingType]);

  async function handleSave() {
    if (!canSave) return;

    await onSubmit?.({
      name,
      description,
      pricingType,
      priceValue: Number(priceValue),
      categoryIds,
      subCategoryIds,
    });
  }

  return (
    <Modal
      open={open}
      title={plan ? "Edit Insurance Plan" : "Add Insurance Plan"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {plan ? "Save" : "Create"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-neutral-600">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Premium Cover"
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">
              Pricing Type
            </label>
            <select
              value={pricingType}
              onChange={(event) => setPricingType(event.target.value)}
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand"
            >
              <option value="percentage">Percentage of rental price</option>
              <option value="fixed_amount">Fixed amount</option>
              <option value="fixed_amount_per_day">Fixed amount per day</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain what the plan covers and when it applies."
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">
            Price Value
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceValue}
            onChange={(event) => setPriceValue(event.target.value)}
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand"
          />
          <p className="mt-1 text-xs text-neutral-500">{pricingHelp}</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold text-neutral-900">Categories</p>
            <p className="mt-1 text-xs text-neutral-500">
              Assign the plan in bulk at category level.
            </p>
            <div className="mt-3 space-y-2">
              {(options?.categories || []).map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(category.id)}
                    onChange={() =>
                      setCategoryIds((current) =>
                        toggleId(current, category.id),
                      )
                    }
                    className="h-4 w-4 accent-brand"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold text-neutral-900">
              Sub-categories
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Refine insurance application below category level.
            </p>
            <div className="mt-3 max-h-72 space-y-2 overflow-auto">
              {(options?.subCategories || []).map((subCategory) => (
                <label
                  key={subCategory.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={subCategoryIds.includes(subCategory.id)}
                    onChange={() =>
                      setSubCategoryIds((current) =>
                        toggleId(current, subCategory.id),
                      )
                    }
                    className="mt-0.5 h-4 w-4 accent-brand"
                  />
                  <span>
                    {subCategory.name}
                    <span className="block text-xs text-neutral-500">
                      {subCategory.categoryName}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-neutral-50 p-4 text-xs text-neutral-600">
          Specific item assignments are managed in the override table. Item
          overrides replace inherited category and sub-category plans.
        </div>
      </div>
    </Modal>
  );
}
