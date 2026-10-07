import React, { useEffect, useState } from "react";
import Drawer from "../shared/Drawer.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import Button from "../shared/Button.jsx";
import { formatDate } from "../../utils/formatters.js";
import * as usersService from "../../services/users.service.js";

/**
 * The user detail panel.
 *
 * It used to be eight read-only fields and nothing else — no way to act on the user it was showing,
 * while the actions that did exist elsewhere mostly did nothing: "Verify" re-fetched the user
 * without verifying, and the edit form never sent the name or phone it collected.
 *
 * Everything here calls a real endpoint and re-reads the user afterwards, so what is on screen is
 * what the server holds rather than an optimistic guess.
 */
export default function UserDetailsDrawer({ open, user, onClose, onChanged }) {
  const [current, setCurrent] = useState(user);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    setCurrent(user);
    setErr("");
    setDoc(null);
  }, [user]);

  // Re-read on open: the row in the table came from a list response, which may be a page old.
  useEffect(() => {
    if (!open || !user?.id) return;
    let alive = true;
    usersService
      .getById(user.id)
      .then((fresh) => alive && setCurrent(fresh))
      .catch(() => {
        /* The list row is still shown; a failed refresh is not worth an error banner. */
      });
    return () => {
      alive = false;
    };
  }, [open, user?.id]);

  async function run(label, fn) {
    setErr("");
    setBusy(label);
    try {
      const updated = await fn();
      if (updated) setCurrent(updated);
      // Let the page refresh its list, so the table agrees with this panel.
      onChanged?.();
    } catch (e) {
      setErr(e?.message || "That action could not be completed.");
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
      // Opened rather than embedded: it is a short-lived signed URL to a private S3 object, and an
      // identity document does not belong in a page that might be screenshotted wholesale.
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErr(e?.message || "The identity document could not be opened.");
    } finally {
      setBusy("");
    }
  }

  return (
    <Drawer open={open} title="User Details" onClose={onClose}>
      {!current ? (
        <p className="text-sm text-neutral-500">No user selected.</p>
      ) : (
        <div className="space-y-4">
          {err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs text-neutral-500">Name</p>
            <p className="text-sm font-semibold text-neutral-900">
              {current.name}
            </p>

            <p className="mt-3 text-xs text-neutral-500">Email</p>
            <p className="text-sm break-all text-neutral-800">{current.email}</p>

            {current.phone ? (
              <>
                <p className="mt-3 text-xs text-neutral-500">Phone</p>
                <p className="text-sm text-neutral-800">{current.phone}</p>
              </>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill value={current.status} />
              {/* Two separate facts. The old panel showed one "Verified" pill driven by the email
                  flag, so an unverified identity looked verified. */}
              <StatusPill
                value={current.emailVerified ? "Email verified" : "Email unverified"}
              />
              <StatusPill
                value={
                  current.identityVerified ? "ID verified" : "ID not verified"
                }
              />
              {current.role === "admin" ? <StatusPill value="Admin" /> : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-neutral-500">Acts as</p>
                <p className="text-sm text-neutral-800">
                  {current.isOwner ? "Owner" : "Renter"}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Last active</p>
                <p className="text-sm text-neutral-800">
                  {formatDate(current.lastActive)}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Listings</p>
                <p className="text-sm text-neutral-800">
                  {current.listingsCount ?? 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Bookings</p>
                <p className="text-sm text-neutral-800">
                  {current.bookingsCount ?? 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Joined</p>
                <p className="text-sm text-neutral-800">
                  {formatDate(current.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs font-semibold text-neutral-700">
              Identity document
            </p>
            {current.hasIdentityDocument ? (
              <>
                <p className="mt-1 text-xs text-neutral-500">
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
                        run("id", () =>
                          usersService.setVerified(current.id, false),
                        )
                      }
                    >
                      Revoke verification
                    </Button>
                  ) : (
                    <Button
                      disabled={Boolean(busy)}
                      onClick={() =>
                        run("id", () =>
                          usersService.setVerified(current.id, true),
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
              <p className="mt-1 text-sm text-neutral-500">
                None uploaded, so there is nothing to approve yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs font-semibold text-neutral-700">Access</p>
            <p className="mt-1 text-xs text-neutral-500">
              Banning blocks sign-in immediately. Admin access cannot be granted
              from here — only removed.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {current.status === "Banned" ? (
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run("ban", () => usersService.unbanUser(current.id))
                  }
                >
                  {busy === "ban" ? "Saving..." : "Lift ban"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run("ban", () => usersService.banUser(current.id))
                  }
                >
                  {busy === "ban" ? "Saving..." : "Ban user"}
                </Button>
              )}

              {/* Granting admin is deliberately not available from the panel. Revoking is, so
                  access can be pulled immediately if an account is compromised; handing it out is
                  an action that should take more thought than one click in a user list. */}
              {current.role === "admin" ? (
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run("role", () =>
                      usersService.update(current.id, { role: "user" }),
                    )
                  }
                >
                  {busy === "role" ? "Saving..." : "Remove admin"}
                </Button>
              ) : null}
            </div>
            {/* The server refuses self-demotion and removing the last admin, and says which; the
                message surfaces in the banner above rather than failing silently. */}
          </div>
        </div>
      )}
    </Drawer>
  );
}
