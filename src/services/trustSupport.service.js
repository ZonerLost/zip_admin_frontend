import { api } from "./apiClient.js";

// ── Normalize API dispute → UI shape ──────────────────────

function normalizeDispute(d) {
  const reportedBy = typeof d.reportedBy === "object" ? d.reportedBy : {};
  const reportedAgainst = typeof d.reportedAgainst === "object" ? d.reportedAgainst : {};
  const booking = typeof d.booking === "object" ? d.booking : {};

  return {
    id: d._id,
    title: d.reason
      ? d.reason.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Dispute",
    bookingId: booking._id ?? booking ?? "—",
    listingTitle: booking.item ?? "—",
    reporter: "User",
    reportedUser:
      `${reportedAgainst.firstName ?? ""} ${reportedAgainst.lastName ?? ""}`.trim() || "—",
    reporterName:
      `${reportedBy.firstName ?? ""} ${reportedBy.lastName ?? ""}`.trim() || "—",
    reporterEmail: reportedBy.email ?? "",
    reportedEmail: reportedAgainst.email ?? "",
    status: mapDisputeStatus(d.status),
    priority: "Medium",
    assignedTo: "Support Team",
    createdAt: d.createdAt,
    notes: d.description ?? "",
    adminNote: d.adminNote ?? "",
    evidence: (d.evidence || []).map((url, i) => ({
      id: `ev_${i}`,
      type: "Photo",
      label: `Evidence ${i + 1}`,
      status: "Approved",
      url,
      uploadedAt: d.createdAt,
    })),
    messages: [],
  };
}

function mapDisputeStatus(apiStatus) {
  const map = {
    open: "Open",
    under_review: "Investigating",
    resolved_for_renter: "Resolved",
    resolved_for_owner: "Resolved",
    resolved_mutually: "Resolved",
    closed: "Resolved",
  };
  return map[apiStatus] ?? "Open";
}

function reverseMapStatus(uiStatus) {
  const map = {
    Open: "open",
    Investigating: "under_review",
    Resolved: "resolved_mutually",
    Rejected: "closed",
  };
  return map[uiStatus] ?? "open";
}

// ── Normalize API review → UI shape ──────────────────────

function normalizeReview(r) {
  const reviewer = typeof r.reviewer === "object" ? r.reviewer : {};
  const reviewee = typeof r.reviewee === "object" ? r.reviewee : {};
  const item = typeof r.item === "object" ? r.item : {};

  return {
    id: r._id,
    listingTitle: item.title ?? "—",
    author:
      `${reviewer.firstName ?? ""} ${reviewer.lastName ?? ""}`.trim() || "—",
    target:
      `${reviewee.firstName ?? ""} ${reviewee.lastName ?? ""}`.trim() || "Owner",
    rating: r.rating ?? 0,
    text: r.comment ?? "",
    status: "Visible",
    createdAt: r.createdAt,
  };
}

// ── Disputes ─────────────────────────────────────────────

export async function listDisputes({
  q = "",
  status = "all",
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", Math.min(pageSize, 50));
  if (status && status !== "all") {
    params.set("status", reverseMapStatus(status));
  }

  const res = await api.get(`/disputes?${params.toString()}`);
  let rows = (res.data || []).map(normalizeDispute);

  if (q) {
    const qq = q.toLowerCase();
    rows = rows.filter((d) =>
      `${d.title} ${d.bookingId} ${d.listingTitle} ${d.reporter} ${d.reportedUser}`
        .toLowerCase()
        .includes(qq),
    );
  }

  const total = res.pagination?.total ?? rows.length;
  return { rows, total };
}

export async function createDispute(_payload) {
  // Disputes are created by users via mobile app, not admin
  throw new Error("Disputes are submitted by users via the mobile app.");
}

export async function updateDispute(id, patch) {
  if (patch.status) {
    const apiStatus = reverseMapStatus(patch.status);
    // Use resolve for terminal statuses, status for workflow
    if (["Resolved", "Rejected"].includes(patch.status)) {
      const resolveStatus =
        patch.status === "Rejected" ? "closed" : "resolved_mutually";
      await api.put(`/disputes/admin/${id}/resolve`, {
        status: resolveStatus,
        adminNote: patch.notes ?? patch.adminNote ?? "",
      });
    } else {
      await api.put(`/disputes/admin/${id}/status`, { status: apiStatus });
    }
  }
  return { id, ...patch };
}

export async function removeDispute(id) {
  await api.put(`/disputes/admin/${id}/status`, { status: "closed" });
  return { ok: true };
}

export async function updateEvidence(disputeId, evidenceId, patch) {
  // Evidence moderation not available via API — return mock update
  return { id: evidenceId, ...patch };
}

export async function updateMessage(disputeId, messageId, patch) {
  // Message moderation not available via API — return mock update
  return { id: messageId, ...patch };
}

// ── Reviews ───────────────────────────────────────────────

export async function listReviews({ q = "", status: _status = "all", page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", Math.min(pageSize, 50));

  const res = await api.get(`/reviews/admin/all?${params.toString()}`).catch(
    () => ({ data: [], pagination: { total: 0 } })
  );

  let rows = (res?.data || []).map(normalizeReview);

  if (q) {
    const qq = q.toLowerCase();
    rows = rows.filter((r) =>
      `${r.listingTitle} ${r.author} ${r.target} ${r.text}`
        .toLowerCase()
        .includes(qq)
    );
  }

  return { rows, total: res?.pagination?.total ?? rows.length };
}

export async function updateReview(id, patch) {
  // Review moderation not available via API yet
  return { id, ...patch };
}

export async function removeReview(_id) {
  // Review removal not available via API yet
  return { ok: true };
}

// ── Notification settings ─────────────────────────────────

export async function getNotificationSettings() {
  return {
    enabled: true,
    channels: { email: true, push: true, sms: false },
    templates: {
      photoUploadReminder: {
        enabled: true,
        subject: "Reminder: Upload photos for your booking",
        body: "Please upload required photos to complete your booking flow.",
      },
      caseProgressUpdate: {
        enabled: true,
        subject: "Update: Your case status changed",
        body: "Your dispute case status has been updated.",
      },
    },
    rules: {
      photoReminderHoursAfterEnd: 6,
      sendCaseUpdatesOnStatusChange: true,
    },
  };
}

export async function saveNotificationSettings(next) {
  // Not configurable via API currently
  return next;
}

export { listNotificationLogs } from "./notifications.service.js";