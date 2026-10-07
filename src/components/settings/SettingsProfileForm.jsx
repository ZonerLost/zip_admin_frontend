import React, { useRef, useState, useEffect } from "react";
import Card from "../shared/Card.jsx";
import Button from "../shared/Button.jsx";
import { FiCamera, FiLoader, FiUpload, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

export default function SettingsProfileForm({ value, onSave, onUploadAvatar }) {
  const [local, setLocal] = useState(value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  function update(patch) {
    setLocal((s) => ({ ...s, ...patch }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      if (onUploadAvatar) {
        const photoUrl = await onUploadAvatar(file);
        if (photoUrl) {
          update({ profilePhoto: photoUrl });
        }
      }
    } catch {
      // toast error already handled by caller
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const can =
    (local?.name || "").trim().length >= 2 &&
    (local?.email || "").trim().length >= 5;

  const initials =
    (local?.name || "Admin")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase() || "A";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Admin Profile</p>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your account avatar, name, and contact details.
          </p>
        </div>
        <div className="rounded-2xl bg-brand-soft p-2 text-brand">
          <FiUser className="h-5 w-5" />
        </div>
      </div>

      {/* Avatar upload section */}
      <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 sm:flex-row sm:items-center">
        <div className="relative group shrink-0">
          {local?.profilePhoto ? (
            <img
              src={local.profilePhoto}
              alt={local.name || "Admin avatar"}
              className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-neutral-200"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-brand-soft text-xl font-bold text-brand shadow-sm ring-2 ring-neutral-200">
              {initials}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
            aria-label="Upload avatar"
          >
            {uploading ? (
              <FiLoader className="h-6 w-6 animate-spin" />
            ) : (
              <FiCamera className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-neutral-800">Profile Avatar</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            PNG, JPG, or WebP up to 5MB.
          </p>

          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs"
            >
              {uploading ? (
                <>
                  <FiLoader className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="mr-1.5 h-3.5 w-3.5" />
                  {local?.profilePhoto ? "Change avatar" : "Upload avatar"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-neutral-600">Full Name</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
            value={local?.name || ""}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Admin Name"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Email Address</label>
          <input
            className="mt-1 w-full cursor-not-allowed rounded-2xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-500 outline-none"
            value={local?.email || ""}
            readOnly
            disabled
          />
          <p className="mt-1 text-xs text-neutral-400">
            Login account email identifier.
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Phone</label>
          <input
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
            value={local?.phone || ""}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+1 555 0100"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button disabled={!can} onClick={() => onSave(local)}>
            Save Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
