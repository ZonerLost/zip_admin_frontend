import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Drawer from "../shared/Drawer.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import Button from "../shared/Button.jsx";
import { FiCopy, FiCheck, FiStar } from "react-icons/fi";
import { formatDate } from "../../utils/formatters.js";
import * as usersService from "../../services/users.service.js";

/**
 * The user detail panel.
 *
 * It began as eight read-only fields with no way to act on the user it was showing. It then gained
 * the actions; this pass gives it the rest of the information the server was already returning —
 * roughly two thirds of the record was being discarded by the normaliser.
 *
 * The payout block is the reason this matters. "Why has this owner not been paid?" was unanswerable
 * from the panel: the connected account's state lived only in the Stripe dashboard, even though the
 * webhook keeps a copy on the user. Requirements due and the disabled reason are usually the whole
 * answer.
 */

function Field({ label, value, hint }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="min-w-0">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="truncate text-sm text-neutral-800" title={String(value)}>
        {value}
      </p>
      {hint ? <p className="text-xs text-neutral-400">{hint}</p> : null}
    </div>
  );
}

function Section({ title, children, note }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-xs font-semibold text-neutral-700">{title}</p>
      {note ? <p className="mt-1 text-xs text-neutral-500">{note}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

// Keyed on the photo URL by its caller, so a different photo remounts this and the failed flag
// resets on its own. Resetting it from an effect would run after a render that still showed the old
// state.
function Avatar({ user }) {
  const [failed, setFailed] = useState(false);

  const initials =
    (user?.name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  // Falls back to initials rather than a broken image: profile photos are S3 URLs on a prefix that
  // is not necessarily public, so the request can legitimately come back 403.
  if (user?.profilePhoto && !failed) {
    return (
      <img
        src={user.profilePhoto}
        alt=""
        onError={() => setFailed(true)}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-700">
      {initials}
    </div>
  );
}

function CopyableId({ id }) {
  const [copied, setCopied] = useState(false);
  if (!id) return null;
  return (
    <button
      type="button"
      className="mt-2 flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-800"
      onClick={() => {
        // Clipboard access can be refused (insecure context, permissions); the id stays visible
        // either way, so a failure needs no error of its own.
        navigator.clipboard
          ?.writeText(id)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {});
      }}
      title="Copy user id"
    >
      {copied ? <FiCheck className="h-3 w-3" /> : <FiCopy className="h-3 w-3" />}
      <span className="font-mono">{id}</span>
    </button>
  );
}

const PROVIDER_LABELS = {
  email: "Email and password",
  google: "Google",
  facebook: "Facebook",
};

export default function UserDetailsDrawer({ open, user, onClose, onChanged }) {
  const [current, setCurrent] = useState(user);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [stale, setStale] = useState(false);
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    setCurrent(user);
    setErr("");
    setDoc(null);
    setStale(false);
  }, [user]);

  // Re-read on open: the row came from a list response and may be a page old.
  useEffect(() => {
    if (!open || !user?.id) return;
    let alive = true;
    usersService
      .getById(user.id)
      .then((fresh) => alive && setCurrent(fresh))
      // Say so rather than silently showing the list row as though it were fresh.
      .catch(() => alive && setStale(true));
    return () => {
      alive = false;
    };
  }, [open, user?.id]);

  async function run(label, fn, successMsg) {
    setErr("");
    setBusy(label);
    const tid = toast.loading("Processing request...");
    try {
      const updated = await fn();
      if (updated) setCurrent(updated);
      toast.success(successMsg || "Action completed successfully", { id: tid });
      onChanged?.();
    } catch (e) {
      const msg = e?.message || "That action could not be completed.";
      setErr(msg);
      toast.error(msg, { id: tid });
    } finally {
      setBusy("");
    }
  }

  async function viewDocument() {
    setErr("");
    setBusy("doc");
    try {
      const result = await usersService.getIdentityDocument(current.id);
      if (!result.url) throw new Error("No document was returned.");
      setDoc(result);
      // Opened rather than embedded: a short-lived signed URL to someone's identity document does
      // not belong inline in a page that might be screenshotted whole.
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      const msg = e?.message || "The identity document could not be opened.";
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy("");
    }
  }

  const p = current?.payout;
  const place = [current?.city, current?.province, current?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Drawer open={open} title="User Details" onClose={onClose}>
      {!current ? (
        <p className="text-sm text-neutral-500">No user selected.</p>
      ) : (
        <div className="space-y-3">
          {err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}
          {stale ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Could not refresh from the server — showing the values from the
              list, which may be out of date.
            </div>
          ) : null}

          {/* ── identity ───────────────────────────────────────────────────── */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-start gap-3">
              <Avatar key={current.profilePhoto || "no-photo"} user={current} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-neutral-900">
                  {current.name}
                </p>
                <p className="truncate text-sm text-neutral-600">
                  {current.email}
                </p>
                {current.rating !== null && current.reviewCount > 0 ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-600">
                    <FiStar className="h-3 w-3" />
                    {current.rating.toFixed(1)} · {current.reviewCount}{" "}
                    {current.reviewCount === 1 ? "review" : "reviews"}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill value={current.status} />
              {current.role === "admin" ? <StatusPill value="Admin" /> : null}
              <StatusPill
                value={
                  current.identityVerified ? "ID verified" : "ID not verified"
                }
              />
              <StatusPill
                value={
                  current.emailVerified ? "Email verified" : "Email unverified"
                }
              />
              {current.phone ? (
                <StatusPill
                  value={
                    current.phoneVerified
                      ? "Phone verified"
                      : "Phone unverified"
                  }
                />
              ) : null}
            </div>

            {current.bio ? (
              <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">
                {current.bio}
              </p>
            ) : null}

            <CopyableId id={current.id} />
          </div>

          {/* ── account ────────────────────────────────────────────────────── */}
          <Section title="Account">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value={current.phone} />
              <Field
                label="Signs in with"
                value={
                  PROVIDER_LABELS[current.authProvider] || current.authProvider
                }
                hint={
                  current.authProvider !== "email"
                    ? "No password on this account"
                    : null
                }
              />
              <Field label="Location" value={place} />
              <Field label="Language" value={current.language} />
              <Field label="Joined" value={formatDate(current.createdAt)} />
              <Field
                label="Last active"
                value={formatDate(current.lastActive)}
              />
            </div>
          </Section>

          {/* ── activity ───────────────────────────────────────────────────── */}
          <Section
            title="Activity"
            note="Counted from the account's own booking history."
          >
            <div className="grid grid-cols-3 gap-3">
              <Field label="Acts as" value={current.isOwner ? "Owner" : "Renter"} />
              <Field label="Listings" value={current.listingsCount ?? 0} />
              <Field label="Bookings" value={current.bookingsCount ?? 0} />
            </div>
          </Section>

          {/* ── payouts ────────────────────────────────────────────────────── */}
          <Section
            title="Payouts"
            note={
              p
                ? "From the connected Stripe account, as the last webhook left it."
                : null
            }
          >
            {!p ? (
              <p className="text-sm text-neutral-500">
                No Stripe account connected, so this user cannot receive money.
                Owners set this up themselves from the app.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill
                    value={p.payoutsEnabled ? "Payouts on" : "Payouts off"}
                  />
                  <StatusPill
                    value={p.chargesEnabled ? "Can be paid" : "Cannot be paid"}
                  />
                  {!p.detailsSubmitted ? (
                    <StatusPill value="Onboarding incomplete" />
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field label="Bank" value={p.bank} />
                  <Field label="Country" value={p.country?.toUpperCase()} />
                  <Field label="Last synced" value={formatDate(p.syncedAt)} />
                </div>

                {p.disabledReason ? (
                  <p className="mt-3 rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-700">
                    Stripe reports:{" "}
                    <span className="font-medium">{p.disabledReason}</span>
                  </p>
                ) : null}

                {p.requirementsDue?.length ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-800">
                      Stripe is still waiting on {p.requirementsDue.length} item
                      {p.requirementsDue.length === 1 ? "" : "s"}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {p.requirementsDue.map((r) => (
                        <li key={r} className="font-mono text-xs text-amber-800">
                          {r}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-amber-700">
                      Only the owner can supply these, in Stripe&rsquo;s hosted
                      flow.
                    </p>
                  </div>
                ) : null}

                <p className="mt-3 font-mono text-xs text-neutral-400">
                  {p.accountId}
                </p>
              </>
            )}
          </Section>

          {/* ── identity document ──────────────────────────────────────────── */}
          <Section title="Identity document">
            {current.hasIdentityDocument ? (
              <>
                <p className="text-xs text-neutral-500">
                  Opens in a new tab via a link that expires in 15 minutes.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={busy === "doc"}
                    onClick={viewDocument}
                  >
                    {busy === "doc" ? "Opening..." : "View document"}
                  </Button>
                  {current.identityVerified ? (
                    <Button
                      variant="outline"
                      disabled={Boolean(busy)}
                      onClick={() =>
                        run(
                          "id",
                          () => usersService.setVerified(current.id, false),
                          "Identity verification revoked",
                        )
                      }
                    >
                      Revoke verification
                    </Button>
                  ) : (
                    <Button
                      disabled={Boolean(busy)}
                      onClick={() =>
                        run(
                          "id",
                          () => usersService.setVerified(current.id, true),
                          "Identity approved successfully",
                        )
                      }
                    >
                      {busy === "id" ? "Saving..." : "Approve identity"}
                    </Button>
                  )}
                </div>
                {doc ? (
                  <p className="mt-2 text-xs text-neutral-500">
                    Link opened. It stops working after{" "}
                    {Math.round((doc.expiresInSeconds || 0) / 60)} minutes.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                None uploaded, so there is nothing to approve yet.
              </p>
            )}
          </Section>

          {/* ── access ─────────────────────────────────────────────────────── */}
          <Section
            title="Access"
            note="Manage account activation and ban restrictions. Admin access is managed in Settings."
          >
            <div className="flex flex-wrap gap-2">
              {current.status === "Banned" ? (
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run(
                      "ban",
                      () => usersService.unbanUser(current.id),
                      "Ban lifted successfully",
                    )
                  }
                >
                  {busy === "ban" ? "Saving..." : "Lift ban"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run(
                      "ban",
                      () => usersService.banUser(current.id),
                      "User banned successfully",
                    )
                  }
                >
                  {busy === "ban" ? "Saving..." : "Ban user"}
                </Button>
              )}

              {current.status === "Deactivated" || current.isActive === false ? (
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run(
                      "reactivate",
                      () => usersService.reactivate(current.id),
                      "Account reactivated successfully",
                    )
                  }
                >
                  {busy === "reactivate" ? "Saving..." : "Reactivate account"}
                </Button>
              ) : current.status !== "Banned" ? (
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run(
                      "deactivate",
                      () => usersService.deactivate(current.id),
                      "Account deactivated successfully",
                    )
                  }
                >
                  {busy === "deactivate" ? "Saving..." : "Deactivate account"}
                </Button>
              ) : null}

              {/* No role control here. Admin access is managed in one place — Settings → Admin
                  Access — so a single screen answers "who can get into this panel". A per-user
                  switch in a details drawer is somewhere nobody thinks to audit. The Admin pill
                  above still shows the state. */}
            </div>
          </Section>
        </div>
      )}
    </Drawer>
  );
}
