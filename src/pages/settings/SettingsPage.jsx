import React, { useEffect, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Button from "../../components/shared/Button.jsx";

import SettingsProfileForm from "../../components/settings/SettingsProfileForm.jsx";
import AdminAccessSection from "../../components/settings/AdminAccessSection.jsx";
import ChangePasswordModal from "../../components/settings/ChangePasswordModal.jsx";

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
    await svc.saveProfile(next);
    await load();
  }

  async function changePassword(payload) {
    return svc.changePassword(payload);
  }

  async function grantAdmin(user) {
    await svc.grantAdmin(user.id);
    await load();
  }

  async function revokeAdmin(user) {
    await svc.revokeAdmin(user.id);
    await load();
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
              <SettingsProfileForm value={profile} onSave={saveProfile} />
            </div>
          ) : null}

          <AdminAccessSection
            admins={admins}
            currentUserId={profile?.id ?? ""}
            onSearch={svc.searchNonAdmins}
            onGrant={grantAdmin}
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
