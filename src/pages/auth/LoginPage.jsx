import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import Button from "../../components/shared/Button.jsx";
import Card from "../../components/shared/Card.jsx";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal.jsx";
// Verify code flow removed — using direct login
import { useAuth } from "../../context/AuthContext.jsx";
import { isValidEmail } from "../../utils/validators.js";
import AtussaLogo from "../../components/brand/AtussaLogo.jsx";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  // Demo credentials — change these if you want different defaults

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);

  const canLogin = useMemo(
    () => isValidEmail(email) && password.length >= 4,
    [email, password]
  );

  async function onLogin() {
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (e) {
      setError(e?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }
  // The reset flow lives entirely in ForgotPasswordModal now: it asks for the code, takes the new
  // password, and reports its own failures. This page only needs to know when it finished, so the
  // email can be carried back into the sign-in field.

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="mx-auto max-w-6xl w-full px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-5 text-center">
            <AtussaLogo variant="vertical" className="mx-auto mb-6 h-36 w-auto" />
            <h1 className="text-2xl font-semibold text-neutral-900">
              Welcome back
            </h1>
          </div>

          <Card className="animate-card-in p-5 sm:p-6">
            {error ? (
              <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-600">
                  Email
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/12">
                  <FiMail className="h-4 w-4 text-neutral-400" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">
                  Password
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/12">
                  <FiLock className="h-4 w-4 shrink-0 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-transparent text-sm outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-4 w-4" />
                    ) : (
                      <FiEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="text-sm font-medium text-brand hover:underline"
                  onClick={() => setForgotOpen(true)}
                  type="button"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                className="w-full"
                disabled={!canLogin || busy}
                onClick={onLogin}
              >
                {busy ? "Please wait..." : "Continue"}
                <FiArrowRight className="h-4 w-4" />
              </Button>

              <p className="pt-2 text-center text-xs text-neutral-500">
                By continuing you agree to the platform policies.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <ForgotPasswordModal
        open={forgotOpen}
        emailDefault={email}
        onClose={() => setForgotOpen(false)}
        onDone={(mail) => setEmail(mail)}
      />
    </div>
  );
}
