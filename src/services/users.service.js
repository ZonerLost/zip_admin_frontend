import { api } from "./apiClient.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(u) {
  return {
    id: u._id,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—",
    email: u.email ?? "",
    status: u.isBanned ? "Disabled" : u.isActive ? "Active" : "Disabled",
    verified: u.isEmailVerified ?? false,
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

export async function getUsersMetrics(_startIso, _endIso) {
  const res = await api.get("/admin/stats");
  const d = res.data;
  return {
    total: d.users?.total ?? 0,
    activeUsers: d.users?.active ?? 0,
    activeOwners: 0,
    activeRenters: 0,
    newUsers: 0,
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

export async function create(_payload) {
  throw new Error("Creating users from admin panel is not supported.");
}

export async function update(id, patch) {
  const apiPatch = {};
  if (patch.name) {
    const parts = patch.name.trim().split(" ");
    apiPatch.firstName = parts[0] ?? "";
    apiPatch.lastName = parts.slice(1).join(" ") ?? "";
  }
  if (patch.email !== undefined) apiPatch.email = patch.email;
  if (patch.phone !== undefined) apiPatch.phone = patch.phone;

  // Use role update if role is being changed
  if (patch.role) {
    await api.put(`/admin/users/${id}/role`, { role: patch.role });
  }

  return normalize({ _id: id, ...patch });
}

export async function remove(id) {
  await api.del(`/admin/users/${id}`);
  return true;
}

export async function setVerified(id, _verified) {
  // No direct verify endpoint — return current user data
  const res = await api.get(`/admin/users/${id}`);
  return normalize(res.data);
}