import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import UsersMetrics, {
  UsersCharts,
} from "../../components/users/UsersMetrics.jsx";
import UsersTable from "../../components/users/UsersTable.jsx";
import UserDetailsDrawer from "../../components/users/UserDetailsDrawer.jsx";
import VerifyUserModal from "../../components/users/VerifyUserModal.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import Card from "../../components/shared/Card.jsx";
import Modal from "../../components/shared/Modal.jsx";
import Button from "../../components/shared/Button.jsx";
import RangeSelector from "../../components/dashboard/RangeSelector.jsx";

import * as usersService from "../../services/users.service.js";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import { DashboardRangeProvider } from "../../context/DashboardRangeContext.jsx";

function UsersPageContent() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [verifyOpen, setVerifyOpen] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [serviceMetrics, setServiceMetrics] = useState(null);
  const [prevServiceMetrics, setPrevServiceMetrics] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadUsers() {
      setLoading(true);
      try {
        const res = await usersService.list({
          q,
          page,
          pageSize,
        });

        if (!alive) return;

        setRows(Array.isArray(res?.rows) ? res.rows : []);
        setTotal(Number(res?.total || 0));
      } catch {
        if (!alive) return;
        setRows([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      alive = false;
    };
  }, [q, page, pageSize]);

  useEffect(() => {
    let alive = true;

    async function loadMetrics() {
      try {
        const currentMetrics = await usersService.getUsersMetrics(
          resolvedRange?.start,
          resolvedRange?.end,
        );

        if (!alive) return;
        setServiceMetrics(currentMetrics || null);

        if (comparePreviousYear) {
          const prev = resolvePreviousYear?.();
          if (prev) {
            const previousMetrics = await usersService.getUsersMetrics(
              prev.start,
              prev.end,
            );

            if (!alive) return;
            setPrevServiceMetrics(previousMetrics || null);
          } else {
            setPrevServiceMetrics(null);
          }
        } else {
          setPrevServiceMetrics(null);
        }
      } catch {
        if (!alive) return;
        setServiceMetrics(null);
        setPrevServiceMetrics(null);
      }
    }

    loadMetrics();

    return () => {
      alive = false;
    };
  }, [resolvedRange, comparePreviousYear, resolvePreviousYear]);

  const stats = useMemo(() => {
    const verified = rows.filter((u) => u.identityVerified || u.verified).length;

    return {
      total,
      verified,
      unverified: Math.max(0, total - verified),
    };
  }, [rows, total]);

  async function refreshUsers() {
    setLoading(true);
    try {
      const res = await usersService.list({
        q,
        page,
        pageSize,
      });
      setRows(Array.isArray(res?.rows) ? res.rows : []);
      setTotal(Number(res?.total || 0));
    } finally {
      setLoading(false);
    }
  }

  async function createUser(payload) {
    try {
      await usersService.create(payload);
      toast.success("User created successfully");
      setPage(1);
      await refreshUsers();
    } catch (e) {
      toast.error(e?.message || "Failed to create user");
      throw e;
    }
  }

  async function updateUser(user, patch) {
    const tid = toast.loading("Updating user...");
    try {
      await usersService.update(user.id, patch);
      toast.success("User updated successfully", { id: tid });
      await refreshUsers();
    } catch (e) {
      toast.error(e?.message || "Failed to update user", { id: tid });
      throw e;
    }
  }

  function viewUser(user) {
    setSelected(user);
    setDrawerOpen(true);
  }

  function askDelete(user) {
    setToDelete(user);
    setConfirmDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;

    setActionError("");
    setDeleting(true);
    const tid = toast.loading("Deactivating user...");
    try {
      await usersService.deactivate(toDelete.id);
      toast.success(`${toDelete.name || "User"} deactivated successfully`, {
        id: tid,
      });
      setConfirmDeleteOpen(false);
      setToDelete(null);
      await refreshUsers();
    } catch (e) {
      toast.error(e?.message || "That user could not be deactivated.", {
        id: tid,
      });
      setActionError(e?.message || "That user could not be deactivated.");
      setConfirmDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  async function reactivateUser(user) {
    if (!user) return;
    const tid = toast.loading("Reactivating user...");
    try {
      await usersService.reactivate(user.id);
      toast.success(`${user.name || "User"} reactivated successfully`, {
        id: tid,
      });
      await refreshUsers();
    } catch (e) {
      toast.error(e?.message || "Failed to reactivate user", { id: tid });
    }
  }

  function openVerify(user) {
    setSelected(user);
    setVerifyOpen(true);
  }

  async function confirmVerify(user) {
    if (!user) return;

    const willVerify = !user.identityVerified;
    const tid = toast.loading(
      willVerify ? "Approving identity..." : "Revoking identity verification...",
    );
    try {
      await usersService.setVerified(user.id, willVerify);
      toast.success(
        willVerify
          ? `${user.name || "User"} identity approved`
          : `${user.name || "User"} identity verification revoked`,
        { id: tid },
      );
      setVerifyOpen(false);
      await refreshUsers();
    } catch (e) {
      toast.error(e?.message || "Failed to update verification", { id: tid });
      throw e;
    }
  }

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Search, inspect, verify and manage access."
        right={
          <div className="flex w-full flex-col gap-2 xl:w-auto xl:flex-row xl:items-center">
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Search users..."
              className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12 sm:w-[320px]"
            />
            <RangeSelector wrap={false} />
          </div>
        }
      />

      {actionError ? (
        <Card className="mt-3 border-red-200 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-red-700">{actionError}</p>
            <button
              className="shrink-0 rounded-lg px-2 text-sm text-red-700 hover:bg-red-100"
              onClick={() => setActionError("")}
            >
              Dismiss
            </button>
          </div>
        </Card>
      ) : null}

      <UsersMetrics
        stats={serviceMetrics}
        prevStats={prevServiceMetrics}
        pageStats={{
          total,
          verified: stats.verified,
          unverified: stats.unverified,
        }}
      />

      <UsersCharts />

      <div className="mt-4 space-y-3 sm:mt-6">
        {loading ? (
          <Card className="p-6">
            <p className="text-sm text-neutral-500">Loading users...</p>
          </Card>
        ) : (
          <>
            <UsersTable
              rows={rows}
              onView={viewUser}
              onCreate={createUser}
              onUpdate={updateUser}
              onDelete={askDelete}
              onReactivate={reactivateUser}
              onVerify={openVerify}
            />

            <div className="mt-3 rounded-2xl border bg-white p-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </div>

      <UserDetailsDrawer
        open={drawerOpen}
        user={selected}
        onClose={() => setDrawerOpen(false)}
        onChanged={refreshUsers}
      />

      <VerifyUserModal
        open={verifyOpen}
        user={selected}
        onClose={() => setVerifyOpen(false)}
        onConfirm={confirmVerify}
      />

      <Modal
        open={confirmDeleteOpen}
        title="Deactivate User"
        onClose={() => !deleting && setConfirmDeleteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Deactivating..." : "Deactivate"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          Deactivate <span className="font-semibold">{toDelete?.name}</span>?
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Nothing is erased. The account is marked inactive, keeps its email
          address, and still appears here as Deactivated. This is what the
          server&rsquo;s delete endpoint does — it was labelled &ldquo;Delete&rdquo;,
          which implied otherwise.
        </p>
      </Modal>
    </>
  );
}

export default function UsersPage() {
  return (
    <PageContainer>
      <DashboardRangeProvider>
        <UsersPageContent />
      </DashboardRangeProvider>
    </PageContainer>
  );
}
