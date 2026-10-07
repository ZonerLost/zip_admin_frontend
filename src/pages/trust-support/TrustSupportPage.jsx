import React, { useEffect, useMemo, useRef, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import Modal from "../../components/shared/Modal.jsx";
import Button from "../../components/shared/Button.jsx";

import DisputesMetrics from "../../components/trustSupport/DisputesMetrics.jsx";
import DisputesTable from "../../components/trustSupport/DisputesTable.jsx";
import DisputeDetailsDrawer from "../../components/trustSupport/DisputeDetailsDrawer.jsx";
import EvidenceReviewPanel from "../../components/trustSupport/EvidenceReviewPanel.jsx";
import MessagingReviewPanel from "../../components/trustSupport/MessagingReviewPanel.jsx";
import ReviewsModerationTable from "../../components/trustSupport/ReviewsModerationTable.jsx";
import toast from "react-hot-toast";

import * as svc from "../../services/trustSupport.service.js";

export default function TrustSupportPage() {
  const disputesLoadedRef = useRef(false);
  const reviewsLoadedRef = useRef(false);
  const metricsLoadedRef = useRef(false);

  const [dq, setDq] = useState("");
  const [dStatus, setDStatus] = useState("all");
  const [dPage, setDPage] = useState(1);
  const [dPageSize] = useState(10);

  const [disputes, setDisputes] = useState([]);
  const [disputesTotal, setDisputesTotal] = useState(0);

  const [rq, setRq] = useState("");
  const [rStatus, setRStatus] = useState("all");
  const [rPage, setRPage] = useState(1);
  const [rPageSize] = useState(10);

  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  const [metricsRows, setMetricsRows] = useState([]);

  const [disputesLoading, setDisputesLoading] = useState(true);
  const [disputesRefreshing, setDisputesRefreshing] = useState(false);

  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsRefreshing, setReviewsRefreshing] = useState(false);

  const [metricsLoading, setMetricsLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  async function loadDisputesTable() {
    const firstLoad = !disputesLoadedRef.current;

    if (firstLoad) {
      setDisputesLoading(true);
    } else {
      setDisputesRefreshing(true);
    }

    try {
      const d = await svc.listDisputes({
        q: dq,
        status: dStatus,
        page: dPage,
        pageSize: dPageSize,
      });

      const nextRows = Array.isArray(d?.rows) ? d.rows : [];
      setDisputes(nextRows);
      setDisputesTotal(Number(d?.total || 0));
      disputesLoadedRef.current = true;

      setSelected((prev) => {
        if (!prev) return prev;
        const fresh = nextRows.find((item) => item.id === prev.id);
        return fresh || prev;
      });
    } finally {
      setDisputesLoading(false);
      setDisputesRefreshing(false);
    }
  }

  async function loadReviewsTable() {
    const firstLoad = !reviewsLoadedRef.current;

    if (firstLoad) {
      setReviewsLoading(true);
    } else {
      setReviewsRefreshing(true);
    }

    try {
      const r = await svc.listReviews({
        q: rq,
        status: rStatus,
        page: rPage,
        pageSize: rPageSize,
      });

      setReviews(Array.isArray(r?.rows) ? r.rows : []);
      setReviewsTotal(Number(r?.total || 0));
      reviewsLoadedRef.current = true;
    } finally {
      setReviewsLoading(false);
      setReviewsRefreshing(false);
    }
  }

  async function loadMetrics() {
    if (!metricsLoadedRef.current) {
      setMetricsLoading(true);
    }

    try {
      const d = await svc.listDisputes({
        q: "",
        status: "all",
        page: 1,
        pageSize: 10000,
      });

      setMetricsRows(Array.isArray(d?.rows) ? d.rows : []);
      metricsLoadedRef.current = true;
    } finally {
      setMetricsLoading(false);
    }
  }

  useEffect(() => {
    loadDisputesTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, dStatus, dPage, dPageSize]);

  useEffect(() => {
    loadReviewsTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rq, rStatus, rPage, rPageSize]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const stats = useMemo(() => {
    const base = metricsRows;
    const open = base.filter((d) => d.status === "Open").length;
    const investigating = base.filter(
      (d) => d.status === "Investigating",
    ).length;
    const resolved = base.filter((d) => d.status === "Resolved").length;
    const evidencePending = base.reduce(
      (sum, d) =>
        sum + (d.evidence || []).filter((e) => e.status === "Pending").length,
      0,
    );

    return {
      total: base.length,
      open,
      investigating,
      resolved,
      evidencePending,
    };
  }, [metricsRows]);

  function viewDispute(dispute) {
    setSelected(dispute);
    setDrawerOpen(true);
  }

  async function createDispute(payload) {
    await svc.createDispute(payload);
    setDPage(1);
    await Promise.all([loadDisputesTable(), loadMetrics()]);
  }

  async function updateDispute(dispute, patch) {
    await svc.updateDispute(dispute.id, patch);
    await Promise.all([loadDisputesTable(), loadMetrics()]);
    setSelected((prev) =>
      prev?.id === dispute.id ? { ...prev, ...patch } : prev,
    );
  }

  function askDelete(dispute) {
    setToDelete(dispute);
    setConfirmDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;

    await svc.removeDispute(toDelete.id);

    setConfirmDeleteOpen(false);
    setToDelete(null);

    if (selected?.id === toDelete.id) {
      setDrawerOpen(false);
      setSelected(null);
    }

    await Promise.all([loadDisputesTable(), loadMetrics()]);
  }

  async function updateStatus(dispute, nextStatus) {
    try {
      await svc.updateDispute(dispute.id, { status: nextStatus });
      toast.success(`Dispute marked as ${nextStatus}`);
      await Promise.all([loadDisputesTable(), loadMetrics()]);
      setSelected((prev) =>
        prev?.id === dispute.id ? { ...prev, status: nextStatus } : prev,
      );
    } catch (e) {
      toast.error(e?.message || "Failed to update dispute status");
    }
  }

  async function approveEvidence(dispute, evidence) {
    try {
      await svc.updateEvidence(dispute.id, evidence.id, { status: "Approved" });
      toast.success("Evidence approved");

      setSelected((prev) =>
        prev?.id === dispute.id
          ? {
              ...prev,
              evidence: (prev.evidence || []).map((item) =>
                item.id === evidence.id ? { ...item, status: "Approved" } : item,
              ),
            }
          : prev,
      );

      await Promise.all([loadDisputesTable(), loadMetrics()]);
    } catch (e) {
      toast.error(e?.message || "Failed to approve evidence");
    }
  }

  async function rejectEvidence(dispute, evidence) {
    try {
      await svc.updateEvidence(dispute.id, evidence.id, { status: "Rejected" });
      toast.success("Evidence rejected");

      setSelected((prev) =>
        prev?.id === dispute.id
          ? {
              ...prev,
              evidence: (prev.evidence || []).map((item) =>
                item.id === evidence.id ? { ...item, status: "Rejected" } : item,
              ),
            }
          : prev,
      );

      await Promise.all([loadDisputesTable(), loadMetrics()]);
    } catch (e) {
      toast.error(e?.message || "Failed to reject evidence");
    }
  }

  async function hideMessage(dispute, message) {
    try {
      await svc.updateMessage(dispute.id, message.id, { status: "Hidden" });
      toast.success("Message hidden");

      setSelected((prev) =>
        prev?.id === dispute.id
          ? {
              ...prev,
              messages: (prev.messages || []).map((item) =>
                item.id === message.id ? { ...item, status: "Hidden" } : item,
              ),
            }
          : prev,
      );

      await loadDisputesTable();
    } catch (e) {
      toast.error(e?.message || "Failed to hide message");
    }
  }

  async function showMessage(dispute, message) {
    try {
      await svc.updateMessage(dispute.id, message.id, { status: "Visible" });
      toast.success("Message visible");

      setSelected((prev) =>
        prev?.id === dispute.id
          ? {
              ...prev,
              messages: (prev.messages || []).map((item) =>
                item.id === message.id ? { ...item, status: "Visible" } : item,
              ),
            }
          : prev,
      );

      await loadDisputesTable();
    } catch (e) {
      toast.error(e?.message || "Failed to show message");
    }
  }

  async function hideReview(review) {
    try {
      await svc.updateReview(review.id, { status: "Hidden" });
      toast.success("Review hidden");
      await loadReviewsTable();
    } catch (e) {
      toast.error(e?.message || "Failed to hide review");
    }
  }

  async function showReview(review) {
    try {
      await svc.updateReview(review.id, { status: "Visible" });
      toast.success("Review visible");
      await loadReviewsTable();
    } catch (e) {
      toast.error(e?.message || "Failed to show review");
    }
  }

  async function removeReview(review) {
    try {
      await svc.updateReview(review.id, { status: "Removed" });
      toast.success("Review removed");
      await loadReviewsTable();
    } catch (e) {
      toast.error(e?.message || "Failed to remove review");
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Trust & Support"
        subtitle="Disputes, evidence review, messaging moderation and reviews control."
        right={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <input
              value={dq}
              onChange={(e) => {
                setDPage(1);
                setDq(e.target.value);
              }}
              placeholder="Search disputes..."
              className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12 sm:w-70"
            />
            <select
              value={dStatus}
              onChange={(e) => {
                setDPage(1);
                setDStatus(e.target.value);
              }}
              className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-45"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        }
      />

      {metricsLoading ? (
        <Card className="mt-4 p-6">
          <p className="text-sm text-neutral-500">Loading dispute metrics...</p>
        </Card>
      ) : (
        <DisputesMetrics stats={stats} />
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="relative">
            {disputesLoading ? (
              <Card className="p-6">
                <p className="text-sm text-neutral-500">Loading disputes...</p>
              </Card>
            ) : (
              <div
                className={
                  disputesRefreshing
                    ? "pointer-events-none opacity-60 transition"
                    : ""
                }
              >
                <DisputesTable
                  rows={disputes}
                  onView={viewDispute}
                  onCreate={createDispute}
                  onUpdate={updateDispute}
                  onDelete={askDelete}
                />
              </div>
            )}

            {disputesRefreshing ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-[1px]">
                <div className="rounded-full border bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm">
                  Updating disputes...
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <Pagination
              page={dPage}
              pageSize={dPageSize}
              total={disputesTotal}
              onChange={setDPage}
            />
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <input
                value={rq}
                onChange={(e) => {
                  setRPage(1);
                  setRq(e.target.value);
                }}
                placeholder="Search reviews..."
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-70"
              />
              <select
                value={rStatus}
                onChange={(e) => {
                  setRPage(1);
                  setRStatus(e.target.value);
                }}
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-40"
              >
                <option value="all">All</option>
                <option value="Visible">Visible</option>
                <option value="Hidden">Hidden</option>
                <option value="Removed">Removed</option>
              </select>
            </div>
          </div>

          <div className="relative">
            {reviewsLoading ? (
              <Card className="p-6">
                <p className="text-sm text-neutral-500">Loading reviews...</p>
              </Card>
            ) : (
              <div
                className={
                  reviewsRefreshing
                    ? "pointer-events-none opacity-60 transition"
                    : ""
                }
              >
                <ReviewsModerationTable
                  rows={reviews}
                  onHide={hideReview}
                  onShow={showReview}
                  onRemove={removeReview}
                />
              </div>
            )}

            {reviewsRefreshing ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-[1px]">
                <div className="rounded-full border bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm">
                  Updating reviews...
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <Pagination
              page={rPage}
              pageSize={rPageSize}
              total={reviewsTotal}
              onChange={setRPage}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Card className="p-5">
            <p className="text-sm font-semibold text-neutral-900">
              Notifications
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Control automated reminders & case updates.
            </p>
            <div className="mt-4">
              <a
                className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-medium text-white hover:opacity-95"
                href="/trust-support/notifications"
              >
                Open Notifications
              </a>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-neutral-900">Guidelines</p>
            <p className="mt-1 text-sm text-neutral-500">
              Keep moderation decisions consistent and well-documented.
            </p>
          </Card>
        </div>
      </div>

      <DisputeDetailsDrawer
        open={drawerOpen}
        dispute={selected}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={updateStatus}
        EvidencePanel={({ dispute }) => (
          <EvidenceReviewPanel
            dispute={dispute}
            onApprove={approveEvidence}
            onReject={rejectEvidence}
          />
        )}
        MessagingPanel={({ dispute }) => (
          <MessagingReviewPanel
            dispute={dispute}
            onHide={hideMessage}
            onShow={showMessage}
          />
        )}
      />

      <Modal
        open={confirmDeleteOpen}
        title="Delete Dispute"
        onClose={() => setConfirmDeleteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          Delete <span className="font-semibold">{toDelete?.title}</span>?
        </p>
      </Modal>
    </PageContainer>
  );
}
