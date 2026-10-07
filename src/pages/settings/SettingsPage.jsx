import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Button from "../../components/shared/Button.jsx";

import SettingsProfileForm from "../../components/settings/SettingsProfileForm.jsx";
import AdminAccessSection from "../../components/settings/AdminAccessSection.jsx";
import ChangePasswordModal from "../../components/settings/ChangePasswordModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

import * as svc from "../../services/settings.service.js";

/**
 * Everything on this page is backed by a real endpoint.
 *
 * Two sections were removed rather than left looking functional:
 *
 *   - **Preferences** (compact tables, show hints, default page size) wrote to localStorage and
 *     nothing anywhere read it back, so all three controls did nothing at all.
 *   - **Team Roles**, a "CRUD roles & permissions" screen over three invented roles in localStorage.
 *     The backend has no roles system — access is one field, `role: "user" | "admin"` — so it is now
 *     Admin Access, which manages the thing that actually exists.
 */
export default function SettingsPage() {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [admins, setAdmins] = useState([]);

  const [pwOpen, setPwOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      // Settled rather than all-or-nothing: a failure listing admins should not blank the profile
      // form, and vice versa.
      const [p, a] = await Promise.allSettled([svc.getProfile(), svc.listAdmins()]);
      if (p.status === "fulfilled") setProfile(p.value);
      if (a.status === "fulfilled") setAdmins(a.value);

      const failed = [p, a].filter((r) => r.status === "rejected");
      if (failed.length) {
        setError(failed[0].reason?.message || "Some settings could not be loaded.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile(next) {
    const tid = toast.loading("Saving profile...");
    try {
      await svc.saveProfile(next);
      toast.success("Profile saved successfully", { id: tid });
      updateUser?.({ name: next.name, phone: next.phone });
      await load();
    } catch (e) {
      toast.error(e?.message || "Failed to save profile", { id: tid });
      throw e;
    }
  }

  async function uploadAvatar(file) {
    const tid = toast.loading("Uploading avatar...");
    try {
      const res = await svc.uploadAvatar(file);
      const photoUrl = res?.profilePhoto || res?.data?.profilePhoto;
      toast.success("Avatar updated successfully", { id: tid });
      if (photoUrl) {
        updateUser?.({ profilePhoto: photoUrl });
      }
      await load();
      return photoUrl;
    } catch (e) {
      toast.error(e?.message || "Failed to upload avatar", { id: tid });
      throw e;
    }
  }

  async function changePassword(payload) {
    const tid = toast.loading("Updating password...");
    try {
      const res = await svc.changePassword(payload);
      toast.success("Password changed successfully", { id: tid });
      return res;
    } catch (e) {
      toast.error(e?.message || "Failed to change password", { id: tid });
      throw e;
    }
  }

  async function revokeAdmin(user) {
    const tid = toast.loading("Revoking admin access...");
    try {
      await svc.revokeAdmin(user.id);
      toast.success("Admin access revoked", { id: tid });
      await load();
    } catch (e) {
      toast.error(e?.message || "Failed to revoke admin access", { id: tid });
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Your profile, admin access and security."
        right={<Button onClick={() => setPwOpen(true)}>Change Password</Button>}
      />

      {error ? (
        <Card className="mb-3 border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      {loading ? (
        <Card className="p-6">
          <p className="text-sm text-neutral-500">Loading...</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {profile ? (
            <div className="grid gap-3 lg:grid-cols-2">
              <SettingsProfileForm
                value={profile}
                onSave={saveProfile}
                onUploadAvatar={uploadAvatar}
              />
            </div>
          ) : null}

          <AdminAccessSection
            admins={admins}
            currentUserId={profile?.id ?? ""}
            onRevoke={revokeAdmin}
          />
        </div>
      )}

      <ChangePasswordModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        onSubmit={changePassword}
      />
    </PageContainer>
  );
}
