import { api } from "./apiClient.js";

// ── Profile ───────────────────────────────────────────────

export async function getProfile() {
  const res = await api.get("/users/profile");
  const u = res.data;
  return {
    // Needed so the admin list can mark "you" and refuse self-demotion before the server has to.
    id: u._id ?? u.id ?? "",
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Admin",
    email: u.email ?? "",
    phone: u.phone ?? "",
  };
}

export async function saveProfile(next) {
  const parts = (next.name || "").trim().split(" ");
  await api.put("/users/profile", {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
    phone: next.phone ?? "",
  });
  return next;
}

// ── Password ──────────────────────────────────────────────

/**
 * Really changes the password, via POST /auth/change-password.
 *
 * This used to validate the inputs, throw them away, and fire a forgot-password email instead — so
 * the form said "password updated" while the password was unchanged and a reset link was sitting in
 * the admin's inbox. The endpoint exists and always did.
 *
 * The rules below mirror the server's Joi schema so a bad password is rejected before a round trip,
 * with the same wording.
 */
export async function changePassword({ currentPassword, newPassword }) {
  if (!currentPassword) throw new Error("Enter your current password.");
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new Error("Password must contain uppercase, lowercase and number");
  }
  if (currentPassword === newPassword) {
    throw new Error("The new password must be different from the current one.");
  }
  await api.post("/auth/change-password", { currentPassword, newPassword });
  return { ok: true, message: "Password updated." };
}

// ── Admin access ──────────────────────────────────────────
//
// There are no custom roles or permissions to manage. The backend models access as a single field on
// the user, `role: "user" | "admin"`, with one endpoint to set it — so a "roles & permissions CRUD"
// screen could only ever be a local-storage mock pretending otherwise, which is what was here
// before: three invented roles with made-up permission strings that granted nothing.
//
// What follows is the access control that actually exists: who is an admin, and granting or
// revoking it.

const ADMIN_PAGE_LIMIT = 100;

function normalizeAdmin(u) {
  return {
    id: u._id ?? u.id ?? "",
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "(no name)",
    email: u.email ?? "",
    role: u.role ?? "user",
    isBanned: Boolean(u.isBanned),
    createdAt: u.createdAt ?? null,
  };
}

export async function listAdmins() {
  const params = new URLSearchParams({ role: "admin", limit: String(ADMIN_PAGE_LIMIT) });
  const res = await api.get(`/admin/users?${params.toString()}`);
  // The role filter is applied server-side, but re-check: a widened filter must never silently
  // present ordinary users as administrators.
  return (res.data || []).map(normalizeAdmin).filter((u) => u.role === "admin");
}

/** Find someone to promote. Returns non-admins only, since admins are already listed. */
export async function searchNonAdmins(query) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({ search: q, limit: "10" });
  const res = await api.get(`/admin/users?${params.toString()}`);
  return (res.data || []).map(normalizeAdmin).filter((u) => u.role !== "admin");
}

export async function grantAdmin(userId) {
  await api.put(`/admin/users/${userId}/role`, { role: "admin" });
  return { ok: true };
}

export async function revokeAdmin(userId) {
  // The server also refuses self-demotion and removing the last admin; both would lock everyone out
  // of the panel with no fix but a database edit. The UI blocks the first case too, so the common
  // mistake never becomes a round trip.
  await api.put(`/admin/users/${userId}/role`, { role: "user" });
  return { ok: true };
}
