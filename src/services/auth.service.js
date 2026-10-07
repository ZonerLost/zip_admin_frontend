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

/**
 * Asks the server to email a six-digit reset code.
 *
 * Takes the address directly. It used to destructure `{ email }` while its only caller passed a
 * plain string, so `email` was undefined, the request failed validation, and the caller had a
 * finally with no catch — you pressed "Send Reset" and absolutely nothing happened.
 *
 * The server answers the same way whether or not the account exists, on purpose, so there is
 * nothing here to branch on.
 */
export async function requestPasswordReset(email) {
  const address = String(email || "").trim();
  if (!address) throw new Error("Enter your email address.");
  await api.post("/auth/forgot-password", { email: address });
  return { ok: true };
}

/**
 * Completes the reset with the emailed code and a new password.
 *
 * The panel had no way to do this at all: it could ask for a code and then offered nowhere to type
 * it. The rules below mirror the server so a password it would reject is caught before the trip.
 */
export async function resetPassword({ email, otp, newPassword }) {
  const code = String(otp || "").trim();
  if (!/^[0-9]{6}$/.test(code)) throw new Error("Enter the six-digit code from the email.");
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*d)/.test(newPassword)) {
    throw new Error("Password must contain uppercase, lowercase and number");
  }
  await api.post("/auth/reset-password", {
    email: String(email || "").trim(),
    otp: code,
    newPassword,
  });
  return { ok: true };
}