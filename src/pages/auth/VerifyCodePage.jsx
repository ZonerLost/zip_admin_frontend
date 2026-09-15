import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import Button from "../../components/shared/Button.jsx";
import Card from "../../components/shared/Card.jsx";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal.jsx";
import VerifyCodeModal from "../../components/auth/VerifyCodeModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { isValidEmail } from "../../utils/validators.js";

export default function LoginPage() {
  const nav = useNavigate();
  const { startOtp, requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const canLogin = useMemo(
    () => isValidEmail(email) && password.length >= 4,
    [email, password]
  );

  async function onLogin() {
    setError("");
    setBusy(true);
    try {
      // Start OTP session (mock) then show verify
      await startOtp(email);
      setVerifyModalOpen(true);
    } catch (e) {
      setError(e?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitForgot(mail) {
    setBusy(true);
    try {
      await requestPasswordReset(mail);
      setForgotOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--mint))]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-[22px] bg-white/70 ring-1 ring-black/5" />
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Sign in using the calm Zip theme.
            </p>
          </div>

          <Card className="animate-card-in p-5 sm:p-6">
            {error ? (
              <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Email
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 focus-within:border-[rgb(var(--brand))] focus-within:ring-4 focus-within:ring-[rgba(71,95,88,0.12)]">
                  <FiMail className="h-4 w-4 text-slate-400" />
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
                <label className="text-xs font-medium text-slate-600">
                  Password
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 focus-within:border-[rgb(var(--brand))] focus-within:ring-4 focus-within:ring-[rgba(71,95,88,0.12)]">
                  <FiLock className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    className="w-full bg-transparent text-sm outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="text-sm font-medium text-[rgb(var(--brand))] hover:underline"
                  onClick={() => setForgotOpen(true)}
                  type="button"
                >
                  Forgot password?
                </button>

                <span className="text-xs text-slate-500">
                  OTP: 123456 (mock)
                </span>
              </div>

              <Button
                className="w-full"
                disabled={!canLogin || busy}
                onClick={onLogin}
              >
                {busy ? "Please wait..." : "Continue"}
                <FiArrowRight className="h-4 w-4" />
              </Button>

              <p className="pt-2 text-center text-xs text-slate-500">
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
        onSubmit={submitForgot}
      />

      <VerifyCodeModal
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onGoVerify={() => nav("/auth/verify", { state: { email } })}
      />
    </div>
  );
}
