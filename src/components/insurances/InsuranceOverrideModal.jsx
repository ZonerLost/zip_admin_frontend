import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

function toggleId(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export default function InsuranceOverrideModal({
  open = false,
  override = null,
  items = [],
  plans = [],
  onClose,
  onSubmit,
}) {
  const [itemId, setItemId] = useState("");
  const [planIds, setPlanIds] = useState([]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItemId(override?.itemId || items?.[0]?.id || "");
    setPlanIds(override?.planIds || []);
  }, [items, open, override]);

  const canSave = itemId && planIds.length > 0;

  async function handleSave() {
    if (!canSave) return;
    await onSubmit?.({ itemId, planIds });
  }

  return (
    <Modal
      open={open}
      title={override ? "Edit Item Override" : "Add Item Override"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {override ? "Save" : "Create"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-neutral-600">
            Specific item
          </label>
          <select
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand"
          >
            {(items || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.subCategoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm font-semibold text-neutral-900">Applied plans</p>
          <p className="mt-1 text-xs text-neutral-500">
            These plans replace the inherited category and sub-category setup.
          </p>
          <div className="mt-3 space-y-2">
            {(plans || []).map((plan) => (
              <label key={plan.id} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={planIds.includes(plan.id)}
                  onChange={() =>
                    setPlanIds((current) => toggleId(current, plan.id))
                  }
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                <span>
                  {plan.name}
                  <span className="block text-xs text-neutral-500">
                    {plan.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
