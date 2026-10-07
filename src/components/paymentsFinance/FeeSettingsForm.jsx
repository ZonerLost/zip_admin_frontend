import React from "react";
import Card from "../shared/Card.jsx";
import { FiPercent } from "react-icons/fi";

/**
 * What the platform charges — read-only.
 *
 * This was an editable form with a Save button, populated from a hardcoded `{ platformFeePercent: 5
 * }`, and the save was a no-op. So it displayed a number that was both unsaveable and **wrong**: the
 * real model is a 15% owner commission plus a 3% renter fee with a $3.99 minimum, and taxes on both.
 * An administrator could edit "5", press Save, see no error, and reasonably believe the platform now
 * took 5%.
 *
 * The rates are compile-time constants in the backend pricing helper, deliberately: changing a
 * commission alters every quote from that moment on, needs the pricing invariant re-checked, and
 * belongs in a release rather than a text box. So this reports them instead of pretending to set
 * them.
 */
function Row({ label, value, hint }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm text-neutral-900">{label}</p>
        {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
      </div>
      <p className="shrink-0 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

export default function FeeSettingsForm({ value }) {
  const v = value || {};
  const pct = (n) => (n === null || n === undefined ? "—" : `${n}%`);
  const money = (n) =>
    n === null || n === undefined ? "—" : `$${Number(n).toFixed(2)}`;

  const unavailable =
    v.ownerCommissionPercent === null && v.renterFeePercent === null;

  return (
    <Card className="p-0">
      <div className="flex items-center gap-2 border-b p-4">
        <div className="rounded-2xl bg-brand-soft p-2 text-brand">
          <FiPercent className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Pricing</p>
          <p className="text-xs text-neutral-500">
            What the platform charges. Set in code, not here.
          </p>
        </div>
      </div>

      <div className="p-4">
        {unavailable ? (
          <p className="text-sm text-neutral-500">
            The server did not report its pricing configuration.
          </p>
        ) : (
          <>
            <Row
              label="Owner commission"
              value={pct(v.ownerCommissionPercent)}
              hint="Taken from the owner's rental amount"
            />
            <Row
              label="Renter fee"
              value={pct(v.renterFeePercent)}
              hint={`Minimum ${money(v.renterFeeMinimum)} per transaction`}
            />
            {(v.taxes || []).map((t) => (
              <Row
                key={t.code}
                label={t.label || t.code}
                value={pct(
                  typeof t.rate === "number"
                    ? Math.round(t.rate * 100000) / 1000
                    : null,
                )}
                hint="Charged on the commission and the renter fee"
              />
            ))}
            <Row label="Currency" value={v.currency || "CAD"} />

            {v.explainer ? (
              <p className="mt-3 rounded-2xl border bg-neutral-50 p-3 text-xs text-neutral-600">
                {v.explainer}
              </p>
            ) : null}

            <p className="mt-3 text-xs text-neutral-500">
              Changing a rate alters every quote from that moment on, so it is a
              release rather than a setting.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
