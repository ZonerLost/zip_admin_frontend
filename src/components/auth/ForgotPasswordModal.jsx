import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";
import { isValidEmail } from "../../utils/validators.js";
import {
  requestPasswordReset,
  resetPassword,
} from "../../services/auth.service.js";

/**
 * Forgot password, both halves.
 *
 * This was half a flow. It asked for an email, called a function whose argument shape did not match
 * what it was passed — so the request failed validation every time — and the caller wrapped it in a
 * try/finally with no catch, so pressing "Send Reset" did nothing at all, silently. Even had it
 * worked, the server emails a six-digit code and the panel offered nowhere to enter it.
 *
 * Now: request the code, then enter it with a new password. Both steps report what happened.
 */
export default function ForgotPasswordModal({
  open,
  emailDefault = "",
  onClose,
  onDone,
}) {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState(emailDefault);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("request");
    setEmail(emailDefault);
    setOtp("");
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
    setErr("");
    setBusy(false);
  }, [open, emailDefault]);

  const strongEnough =
    password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);

  const canRequest = isValidEmail(email) && !busy;
  const canReset =
    /^[0-9]{6}$/.test(otp.trim()) &&
    strongEnough &&
    confirm === password &&
    !busy;

  async function sendCode() {
    if (!canRequest) return;
    setErr("");
    setBusy(true);
    try {
      await requestPasswordReset(email);
      // Straight to the code step. The server answers identically whether or not the account
      // exists — deliberately, so addresses cannot be probed — so there is nothing to branch on
      // and no point claiming an email definitely arrived.
      setStep("reset");
    } catch (e) {
      setErr(e?.message || "Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (!canReset) return;
    setErr("");
    setBusy(true);
    try {
      await resetPassword({ email, otp, newPassword: password });
      setStep("done");
    } catch (e) {
      setErr(e?.message || "That code did not work.");
    } finally {
      setBusy(false);
    }
  }

  const footer =
    step === "done" ? (
      <div className="flex justify-end">
        <Button
          onClick={() => {
            onDone?.(email);
            onClose?.();
          }}
        >
          Back to sign in
        </Button>
      </div>
    ) : (
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        {step === "request" ? (
          <Button disabled={!canRequest} onClick={sendCode}>
            {busy ? "Sending..." : "Send code"}
          </Button>
        ) : (
          <Button disabled={!canReset} onClick={finish}>
            {busy ? "Saving..." : "Set new password"}
          </Button>
        )}
      </div>
    );

  return (
    <Modal
      open={open}
      title={step === "done" ? "Password updated" : "Forgot password"}
      onClose={onClose}
      footer={footer}
    >
      {err ? (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {step === "request" ? (
        <>
          <p className="text-sm text-neutral-600">
            We&rsquo;ll email a six-digit code to this address if an account
            exists for it.
          </p>
          <div className="mt-4">
            <label className="text-xs font-medium text-neutral-600">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </div>
        </>
      ) : null}

      {step === "reset" ? (
        <>
          <p className="text-sm text-neutral-600">
            If <span className="font-medium">{email}</span> has an account, a
            code is on its way. It expires shortly, and asking again replaces
            it — so use the newest email.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                Six-digit code
              </label>
              <input
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600">
                New password
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/12">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent text-sm outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              <p className="mt-1 text-xs text-neutral-500">
                At least 8 characters, with an uppercase letter, a lowercase
                letter and a number.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600">
                Confirm password
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/12">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full bg-transparent text-sm outline-none"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirm && confirm !== password ? (
                <p className="mt-1 text-xs text-rose-600">
                  These do not match.
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="text-xs text-neutral-500 underline hover:text-neutral-800"
              disabled={busy}
              onClick={() => {
                setStep("request");
                setErr("");
              }}
            >
              Use a different email
            </button>
          </div>
        </>
      ) : null}

      {step === "done" ? (
        <p className="text-sm text-neutral-600">
          Your password has been changed. Every signed-in session was ended, so
          sign in again with the new password.
        </p>
      ) : null}
    </Modal>
  );
}
