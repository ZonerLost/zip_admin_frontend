import React, { useEffect, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Button from "../../components/shared/Button.jsx";

import SettingsProfileForm from "../../components/settings/SettingsProfileForm.jsx";
import SettingsPreferencesForm from "../../components/settings/SettingsPreferencesForm.jsx";
import TeamRolesSection from "../../components/settings/TeamRolesSection.jsx";
import ChangePasswordModal from "../../components/settings/ChangePasswordModal.jsx";

import * as svc from "../../services/settings.service.js";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [roles, setRoles] = useState([]);

  const [pwOpen, setPwOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, pr, r] = await Promise.all([
        svc.getProfile(),
        svc.getPreferences(),
        svc.listRoles(),
      ]);
      setProfile(p);
      setPrefs(pr);
      setRoles(r);
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

  async function savePrefs(next) {
    await svc.savePreferences(next);
    await load();
  }

  async function changePassword(payload) {
    await svc.changePassword(payload);
  }

  async function createRole(payload) {
    await svc.createRole(payload);
    await load();
  }

  async function updateRole(role, patch) {
    await svc.updateRole(role.id, patch);
    await load();
  }

  async function deleteRole(role) {
    await svc.removeRole(role.id);
    await load();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Profile, preferences, roles and security."
        right={<Button onClick={() => setPwOpen(true)}>Change Password</Button>}
      />

      {loading ? (
        <Card className="p-6">
          <p className="text-sm text-slate-500">Loading...</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-2">
            {profile ? (
              <SettingsProfileForm value={profile} onSave={saveProfile} />
            ) : null}
            {prefs ? (
              <SettingsPreferencesForm value={prefs} onSave={savePrefs} />
            ) : null}
          </div>

          <TeamRolesSection
            roles={roles}
            onCreate={createRole}
            onUpdate={updateRole}
            onDelete={deleteRole}
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
