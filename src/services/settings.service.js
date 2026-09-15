import { api } from "./apiClient.js";

// ── Profile ───────────────────────────────────────────────

export async function getProfile() {
  const res = await api.get("/users/profile");
  const u = res.data;
  return {
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

// ── Preferences (local only — not in API) ────────────────

const LS_PREFS = "zip_admin_prefs_v1";

function readPrefs() {
  try {
    const raw = localStorage.getItem(LS_PREFS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function getPreferences() {
  return readPrefs() ?? { compactTables: false, showHelpHints: true, defaultPageSize: 10 };
}

export async function savePreferences(next) {
  localStorage.setItem(LS_PREFS, JSON.stringify(next));
  return next;
}

// ── Password ──────────────────────────────────────────────

export async function changePassword({ currentPassword, newPassword }) {
  if (!currentPassword || String(currentPassword).length < 4) {
    throw new Error("Current password is invalid.");
  }
  if (!newPassword || String(newPassword).length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }
  // Trigger forgot-password flow since there is no direct change-password endpoint
  const res = await api.get("/users/profile");
  await api.post("/auth/forgot-password", { email: res.data.email });
  return { ok: true, message: "Password reset link sent to your email." };
}

// ── Roles (local only — managed via API admin endpoints) ──

const LS_ROLES = "zip_admin_roles_v1";

function readRoles() {
  try {
    const raw = localStorage.getItem(LS_ROLES);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function listRoles() {
  return readRoles() ?? [
    { id: "role_1", name: "Super Admin", permissions: ["*"] },
    { id: "role_2", name: "Support Admin", permissions: ["disputes.manage", "reviews.moderate"] },
    { id: "role_3", name: "Finance Admin", permissions: ["finance.view", "refunds.create"] },
  ];
}

export async function createRole({ name, permissions }) {
  const all = await listRoles();
  const role = { id: `role_${Date.now()}`, name: String(name || "").trim(), permissions: permissions || [] };
  localStorage.setItem(LS_ROLES, JSON.stringify([role, ...all]));
  return role;
}

export async function updateRole(id, patch) {
  const all = await listRoles();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Role not found.");
  all[idx] = { ...all[idx], ...patch };
  localStorage.setItem(LS_ROLES, JSON.stringify(all));
  return all[idx];
}

export async function removeRole(id) {
  const all = await listRoles();
  localStorage.setItem(LS_ROLES, JSON.stringify(all.filter((r) => r.id !== id)));
  return { ok: true };
}