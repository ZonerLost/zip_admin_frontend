import React, { useEffect, useState } from "react";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import NumberOfUsers from "./NumberOfUsers.jsx";
import ActiveUsers from "./ActiveUsers.jsx";
import ActiveOwners from "./ActiveOwners.jsx";
import ActiveRenters from "./ActiveRenters.jsx";
import NewUsers from "./NewUsers.jsx";
import Modal from "../shared/Modal.jsx";
import UsersTable from "./UsersTable.jsx";
import UserDetailsDrawer from "./UserDetailsDrawer.jsx";
import * as usersService from "../../services/users.service.js";

function formatDelta(current, prev) {
  if (prev == null) return null;
  const diff = current - prev;
  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
  const abs = Math.abs(diff);
  const pct = prev ? Math.round((diff / prev) * 100) : null;
  if (pct == null) return `${sign}${abs} vs prev`;
  return `${sign}${abs} (${pct}%) vs prev`;
}

export default function UsersMetrics({ stats, prevStats, pageStats }) {
  const s = stats || {};
  const p = prevStats || {};

  const total = s.total ?? pageStats?.total ?? 0;
  const activeUsers = s.activeUsers ?? 0;
  const activeOwners = s.activeOwners ?? 0;
  const activeRenters = s.activeRenters ?? 0;
  const newUsers = s.newUsers ?? 0;

  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [unverifiedOpen, setUnverifiedOpen] = useState(false);
  const [unverifiedRows, setUnverifiedRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await usersService.list({ page: 1, pageSize: 10000 });
        if (!alive) return;
        const rows = res.rows || [];
        const unv = rows.filter((u) => !u.verified).length;
        setUnverifiedCount(unv);
      } catch {
        // ignore errors
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  async function openUnverified() {
    try {
      const res = await usersService.list({ page: 1, pageSize: 10000 });
      const rows = res.rows || [];
      const unv = rows.filter((u) => !u.verified);
      setUnverifiedRows(unv);
      setUnverifiedOpen(true);
    } catch {
      // ignore errors while loading unverified users
      setUnverifiedRows([]);
      setUnverifiedOpen(true);
    }
  }

  async function handleVerify(user) {
    try {
      await usersService.setVerified(user.id, true);
      // refresh list and counts
      const res = await usersService.list({ page: 1, pageSize: 10000 });
      const rows = res.rows || [];
      const unv = rows.filter((u) => !u.verified);
      setUnverifiedRows(unv);
      setUnverifiedCount(unv.length);
    } catch {
      // ignore
    }
  }

  async function handleDelete(user) {
    try {
      await usersService.remove(user.id);
      const res = await usersService.list({ page: 1, pageSize: 10000 });
      const rows = res.rows || [];
      const unv = rows.filter((u) => !u.verified);
      setUnverifiedRows(unv);
      setUnverifiedCount(unv.length);
    } catch {
      // ignore
    }
  }

  function handleView(user) {
    setSelectedUser(user);
    setDetailsOpen(true);
  }

  const prevTotal = p.total ?? null;
  const prevActive = p.activeUsers ?? null;
  const prevOwners = p.activeOwners ?? null;
  const prevRenters = p.activeRenters ?? null;
  const prevNew = p.newUsers ?? null;

  return (
    <div className="space-y-3">
      <MetricsGrid>
        <MetricCard
          title="Total Users"
          value={total}
          icon={FiUsers}
          helperText={formatDelta(total, prevTotal)}
        />
        <MetricCard
          title="New Users"
          value={newUsers}
          icon={FiUserPlus}
          helperText={formatDelta(newUsers, prevNew)}
        />
        <MetricCard
          title="Active Users"
          value={activeUsers}
          helperText={formatDelta(activeUsers, prevActive)}
        />
        <MetricCard
          title="Active Owners"
          value={activeOwners}
          helperText={formatDelta(activeOwners, prevOwners)}
        />
        <MetricCard
          title="Active Renters"
          value={activeRenters}
          helperText={formatDelta(activeRenters, prevRenters)}
        />
        <MetricCard
          title="Unverified Users"
          value={unverifiedCount}
          onClick={openUnverified}
        />
      </MetricsGrid>

      <Modal
        open={unverifiedOpen}
        title={`Unverified Users (${unverifiedCount})`}
        onClose={() => setUnverifiedOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              className="rounded-2xl border px-4 py-2 text-sm"
              onClick={() => setUnverifiedOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div>
          <UsersTable
            rows={unverifiedRows}
            onView={handleView}
            onVerify={handleVerify}
            onDelete={handleDelete}
            onCreate={() => {}}
            onUpdate={() => {}}
          />
        </div>
      </Modal>

      <UserDetailsDrawer
        open={detailsOpen}
        user={selectedUser}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}

export function UsersCharts() {
  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-1">
        <NumberOfUsers />
        <NewUsers />
      </div>

      <div className="grid gap-3 grid-cols-1 lg:grid-cols-1">
        <ActiveUsers />
        <ActiveOwners />
        <ActiveRenters />
      </div>
    </div>
  );
}
