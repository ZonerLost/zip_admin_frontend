import React, { useState } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiImage, FiExternalLink, FiAlertTriangle } from "react-icons/fi";

/**
 * The evidence a party attached to a dispute.
 *
 * This used to show a grey box reading "Evidence preview placeholder (connect to storage URLs
 * later)" under every item — while the service was already handing it a working, pre-signed URL it
 * simply ignored. So the one thing an adjudicator needs, the actual photo, was the one thing not on
 * screen.
 *
 * The Approve and Reject buttons are gone. Evidence is a `string[]` of URLs on the dispute: there is
 * no approval state to write, and the service's updateEvidence returned a fabricated object without
 * calling anything, so pressing either did nothing. They also never appeared, because the normaliser
 * hardcoded every item's status to "Approved" and the buttons only rendered for "Pending".
 *
 * Nor are they worth building. Evidence submitted by a party in a dispute is weighed, not approved —
 * an administrator marking a photo "rejected" says nothing a resolution note cannot say better, and
 * implies the other party's submission was struck from the record.
 */
function EvidenceItem({ item }) {
  const [failed, setFailed] = useState(false);
  // Expiry is deliberately not computed during render: reading the clock there is impure, and the
  // load failure already tells us. An expired signed link and a missing file look the same to the
  // browser, so the message below covers both rather than guessing which.

  return (
    <div className="rounded-2xl border bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-neutral-900">
          {item.label}
        </p>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900"
          >
            <FiExternalLink className="h-3 w-3" />
            Full size
          </a>
        ) : null}
      </div>

      <div className="mt-2 overflow-hidden rounded-xl border bg-neutral-50">
        {!item.url || failed ? (
          <div className="flex items-center gap-2 p-4 text-xs text-neutral-500">
            <FiAlertTriangle className="h-4 w-4 shrink-0" />
            This file could not be shown. The signed link may have expired —
            close and reopen the dispute for a fresh one.
          </div>
        ) : (
          // Evidence can be any uploaded file, so a non-image falls back to the message above
          // rather than rendering as a broken picture.
          <img
            src={item.url}
            alt={item.label}
            loading="lazy"
            onError={() => setFailed(true)}
            className="max-h-72 w-full bg-neutral-100 object-contain"
          />
        )}
      </div>
    </div>
  );
}

export default function EvidenceReviewPanel({ dispute }) {
  const evidence = dispute?.evidence || [];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Evidence</p>
          <p className="mt-1 text-sm text-neutral-500">
            Files the parties attached. Links are signed and expire.
          </p>
        </div>
        <div className="rounded-2xl bg-brand-soft p-2 text-brand">
          <FiImage className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {evidence.length === 0 ? (
          <p className="text-sm text-neutral-500">No evidence uploaded.</p>
        ) : (
          evidence.map((e) => (
            <EvidenceItem key={e.id} item={e} />
          ))
        )}
      </div>

      {evidence.length > 0 ? (
        <p className="mt-3 text-xs text-neutral-500">
          Record your decision in the resolution note — evidence itself is not
          approved or rejected.
        </p>
      ) : null}

      {evidence.length > 0 ? (
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={() =>
              evidence.forEach(
                (e) =>
                  e.url && window.open(e.url, "_blank", "noopener,noreferrer"),
              )
            }
          >
            Open all in new tabs
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
