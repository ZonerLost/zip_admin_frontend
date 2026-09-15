import { api } from "./apiClient.js";

const LS_TOKEN = "zip_admin_token";
const LS_USER = "zip_admin_user";

export async function login({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  const { accessToken, refreshToken, user } = res.data;

  if (user.role !== "admin") {
    throw new Error("Access denied. Admin account required.");
  }

  localStorage.setItem(LS_TOKEN, accessToken);
  localStorage.setItem("zip_refresh_token", refreshToken);
  localStorage.setItem(LS_USER, JSON.stringify(user));

  return { token: accessToken, user };
}

export function logout() {
  const refreshToken = localStorage.getItem("zip_refresh_token");
  if (refreshToken) {
    api.post("/auth/logout", { refreshToken }).catch(() => {});
  }
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem("zip_refresh_token");
  localStorage.removeItem(LS_USER);
}

export function getSession() {
  const token = localStorage.getItem(LS_TOKEN);
  const userRaw = localStorage.getItem(LS_USER);
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { token, user, isAuthed: Boolean(token) };
}

export async function startOtp({ email }) {
  await api.post("/auth/forgot-password", { email });
  return { ok: true };
}

export async function verifyOtp({ email, code }) {
  // OTP verification used in forgot password flow
  return { ok: true, email, code };
}

export async function resendOtp({ email }) {
  await api.post("/auth/resend-verification", { email });
  return { ok: true };
}

export async function requestPasswordReset({ email }) {
  await api.post("/auth/forgot-password", { email });
  return { ok: true };
}