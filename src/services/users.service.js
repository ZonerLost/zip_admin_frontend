import { api } from "./apiClient.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(u) {
  return {
    id: u._id,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—",
    email: u.email ?? "",
    // isActive false is a soft delete (that is what DELETE /admin/users/:id does), so it is
    // reported as Deactivated rather than lumped in with Banned — they need different undo actions.
    status: u.isBanned ? "Banned" : u.isActive === false ? "Deactivated" : "Active",
    // Two different things, previously collapsed into one "Verified" pill: the user confirmed their
    // email address, versus an administrator approved their identity document.
    verified: u.isEmailVerified ?? false,
    emailVerified: u.isEmailVerified ?? false,
    identityVerified: u.isIdentityVerified ?? false,
    hasIdentityDocument: Boolean(u.identityDocument),
    isActive: u.isActive !== false,
    phoneVerified: u.isPhoneVerified ?? false,
    bio: u.bio ?? "",
    language: u.language ?? null,
    // email | google | facebook. Worth surfacing: a social account has no password, which changes
    // what support can tell them, and explains a missing phone number.
    authProvider: u.authProvider ?? "email",
    rating: typeof u.averageRating === "number" ? u.averageRating : null,
    reviewCount: u.totalReviews ?? 0,
    city: u.location?.city ?? null,
    province: u.location?.province ?? null,
    country: u.location?.country ?? null,
    // Payout state, straight from the connected account as the webhook last left it. Without this
    // the only answer to "why has this owner not been paid" was to open the Stripe dashboard.
    payout: u.stripeAccount?.id
      ? {
          accountId: u.stripeAccount.id,
          chargesEnabled: Boolean(u.stripeAccount.chargesEnabled),
          payoutsEnabled: Boolean(u.stripeAccount.payoutsEnabled),
          detailsSubmitted: Boolean(u.stripeAccount.detailsSubmitted),
          requirementsDue: u.stripeAccount.requirementsDue ?? [],
          disabledReason: u.stripeAccount.disabledReason ?? null,
          bank: u.stripeAccount.bankLast4
            ? `${u.stripeAccount.bankName || "Bank"} ····${u.stripeAccount.bankLast4}`
            : null,
          country: u.stripeAccount.country ?? null,
          syncedAt: u.stripeAccount.syncedAt ?? null,
        }
      : null,
    isOwner: (u.lendingHistory?.length ?? 0) > 0,
    listingsCount: u.lendingHistory?.length ?? 0,
    bookingsCount: u.rentalHistory?.length ?? 0,
    lastActive: u.lastLoginAt ?? u.updatedAt ?? null,
    role: u.role ?? "user",
    isBanned: u.isBanned ?? false,
    phone: u.phone ?? null,
    profilePhoto: u.profilePhoto ?? null,
    location: u.location ?? null,
    createdAt: u.createdAt,
  };
}

// ── Chart series helpers ──────────────────────────────────

function buildEmptySeries(key, start, end) {
  const fallbackEnd = new Date();
  const fallbackStart = new Date(fallbackEnd.getTime() - 6 * DAY_MS);
  const startMs = start ? new Date(start).getTime() : fallbackStart.getTime();
  const endMs = end ? new Date(end).getTime() : fallbackEnd.getTime();
  const days = Math.max(1, Math.round((endMs - startMs) / DAY_MS) + 1);
  return Array.from({ length: Math.min(days, 7) }, (_, i) => {
    const d = new Date(startMs + i * DAY_MS);
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      [key]: 0,
    };
  });
}

export async function getUsersSeries(startIso, endIso) {
  return buildEmptySeries("users", startIso, endIso);
}
export async function getNewUsersSeries(startIso, endIso) {
  return buildEmptySeries("signups", startIso, endIso);
}
export async function getActiveUsersSeries(startIso, endIso) {
  return buildEmptySeries("active", startIso, endIso);
}
export async function getActiveOwnersSeries(startIso, endIso) {
  return buildEmptySeries("owners", startIso, endIso);
}
export async function getActiveRentersSeries(startIso, endIso) {
  return buildEmptySeries("renters", startIso, endIso);
}

export async function getUsersMetrics(startIso, endIso) {
  const params = new URLSearchParams();
  const start = startIso ? new Date(startIso) : null;
  const end = endIso ? new Date(endIso) : null;
  if (start && !Number.isNaN(start.getTime())) params.set("start", start.toISOString());
  if (end && !Number.isNaN(end.getTime())) params.set("end", end.toISOString());
  const qs = params.toString();
  const res = await api.get(`/admin/stats${qs ? `?${qs}` : ""}`);
  const d = res.data;
  return {
    total: d.users?.total ?? 0,
    activeUsers: d.users?.active ?? 0,
    activeOwners: 0,
    activeRenters: 0,
    newUsers: d.users?.new ?? 0,
  };
}

// ── Main CRUD ────────────────────────────────────────────

export async function list({
  q = "",
  page = 1,
  pageSize = 10,
  inactiveMonths = null,
  role = null,
  minListings = null,
  minBookings = null,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", Math.min(pageSize, 50));
  if (q) params.set("search", q);
  if (role === "owner") params.set("role", "user");
  else if (role === "admin") params.set("role", "admin");

  const res = await api.get(`/admin/users?${params.toString()}`);
  let rows = (res.data || []).map(normalize);

  // Client-side filters not supported by API
  if (inactiveMonths != null) {
    const cutoff = Date.now() - inactiveMonths * 30 * DAY_MS;
    rows = rows.filter((u) => {
      const last = u.lastActive ? new Date(u.lastActive).getTime() : 0;
      return last <= cutoff;
    });
  }
  if (role === "owner") rows = rows.filter((u) => u.isOwner);
  if (role === "renter") rows = rows.filter((u) => !u.isOwner);
  if (minListings != null) rows = rows.filter((u) => (u.listingsCount || 0) >= Number(minListings));
  if (minBookings != null) rows = rows.filter((u) => (u.bookingsCount || 0) >= Number(minBookings));

  const total = res.pagination?.total ?? rows.length;
  return { rows, total };
}

/**
 * One user, fresh from the server.
 *
 * Every mutation below returns this rather than a locally patched copy, so the UI shows what the
 * server actually holds — the old update() returned a fabricated object and the form looked saved
 * whether or not anything had been written.
 */
export async function getById(id) {
  const res = await api.get(`/admin/users/${id}`);
  return normalize(res.data);
}

export async function create(_payload) {
  // There is no admin signup endpoint, and inventing one would mean setting someone's password for
  // them. Users register themselves; an admin grants access afterwards.
  throw new Error("Users cannot be created from the admin panel. Ask them to register.");
}

/**
 * Saves profile fields and/or the role.
 *
 * This used to build a patch of firstName/lastName/email/phone and then **never send it** — only the
 * role request went out, and the function returned a fabricated object so the form looked saved
 * while the name and phone were unchanged.
 *
 * Email is not editable by an administrator: it is the login identity, it is unique, and it carries
 * a verification state, so changing it for someone would lock them out while still claiming the new
 * address was confirmed. The server rejects it too.
 */
export async function update(id, patch) {
  const profile = {};
  if (patch.name !== undefined) {
    const parts = String(patch.name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) throw new Error("A name is required.");
    profile.firstName = parts[0];
    // Everything after the first word is the surname, so "Ana Maria Silva" keeps "Maria Silva"
    // rather than losing the middle name.
    profile.lastName = parts.slice(1).join(" ");
  }
  if (patch.phone !== undefined) profile.phone = patch.phone ?? "";

  if (Object.keys(profile).length > 0) {
    await api.put(`/admin/users/${id}`, profile);
  }
  if (patch.role) {
    // Separate endpoint, and it can legitimately refuse — self-demotion and removing the last
    // admin are both blocked server-side — so this is not folded into the profile call.
    await api.put(`/admin/users/${id}/role`, { role: patch.role });
  }

  // Return what the server now holds, not what was asked for.
  return getById(id);
}

/**
 * Deactivates a user.
 *
 * `DELETE /admin/users/:id` sets `isActive: false` — a soft delete. Nothing is erased, and the row
 * stays in listings as Deactivated. Named honestly here so the UI can say so.
 */
export async function deactivate(id) {
  await api.del(`/admin/users/${id}`);
  return true;
}

// Kept so existing callers keep working, pointing at the same soft delete.
export const remove = deactivate;

export async function banUser(id) {
  await api.put(`/admin/users/${id}/ban`, {});
  return getById(id);
}

export async function unbanUser(id) {
  await api.put(`/admin/users/${id}/unban`, {});
  return getById(id);
}

export async function reactivate(id) {
  return unbanUser(id);
}

/**
 * Approves or rejects a user's identity document.
 *
 * This used to just re-fetch the user — the comment claimed "No direct verify endpoint", but
 * `PUT /admin/users/:id/verify-identity` exists and sets `isIdentityVerified`. So the admin pressed
 * Verify, the list reloaded unchanged, and nothing had happened.
 */
export async function setVerified(id, verified) {
  await api.put(`/admin/users/${id}/verify-identity`, {
    action: verified ? "approve" : "reject",
  });
  return getById(id);
}

/** A short-lived signed URL for the uploaded identity document. */
export async function getIdentityDocument(id) {
  const res = await api.get(`/admin/users/${id}/identity-doc`);
  return {
    url: res.data?.signedUrl ?? "",
    expiresInSeconds: res.data?.expiresInSeconds ?? 0,
  };
}