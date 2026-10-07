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
    // The URLs arrive pre-signed from the server. The panel used to ignore them and render a
    // placeholder, and "status" was hardcoded to "Approved" for every item — which is why the
    // Approve/Reject buttons, gated on "Pending", never appeared at all.
    evidence: (d.evidence || []).map((url, i) => ({
      id: `ev_${i}`,
      label: `Evidence ${i + 1}`,
      url,
      uploadedAt: d.createdAt,
    })),
    // So the panel can say "the link expired" instead of showing a broken image.
    evidenceUrlsExpireAt: d.evidenceUrlsExpireAt ?? null,
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

/**
 * The conversation between the two parties to a dispute.
 *
 * Replaces `messages: []`, which is why the Messaging Review panel said "No messages" for every
 * dispute ever opened. A dispute has no messages of its own; the reporter and the person reported
 * have a chat, and that is the record an adjudicator needs.
 */
export async function getDisputeMessages(disputeId) {
  const res = await api.get(`/admin/disputes/${disputeId}/messages`);
  const d = res.data || {};
  return {
    conversationId: d.conversationId ?? null,
    participants: d.participants ?? null,
    truncated: Boolean(d.truncated),
    messages: (d.messages || []).map((m) => {
      const sender = m.sender && typeof m.sender === "object" ? m.sender : null;
      const name = sender
        ? `${sender.firstName ?? ""} ${sender.lastName ?? ""}`.trim()
        : "";
      return {
        id: String(m._id || m.id),
        senderId: String(sender?._id ?? m.sender ?? ""),
        author: name || sender?.email || "(deleted user)",
        text: m.content ?? "",
        imageUrl: m.imageUrl ?? null,
        createdAt: m.createdAt,
      };
    }),
  };
}

// There is deliberately no updateEvidence or updateMessage here. Both existed and both returned a
// fabricated object without calling anything — evidence is a plain list of URLs with no approval
// state to write, and the chat service does not let a third party alter a participant's message.
// Neither is worth inventing: evidence in a dispute is weighed, and the weighing belongs in the
// resolution note.

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

/**
 * Notification settings, from the server.
 *
 * This used to return a hardcoded object describing email and SMS channels, editable subject/body
 * templates and a "photo reminder N hours after end" rule — none of which exist in the backend.
 * Notifications are in-app only, their wording is hardcoded server-side, and there is no scheduler.
 * Save returned its own argument, so the form reported success and changed nothing.
 *
 * What the server can genuinely honour is a master switch and per-type muting, both read by the
 * notification sender before it creates anything. That is what this returns.
 */
export async function getNotificationSettings() {
  const res = await api.get("/admin/notifications/settings");
  const d = res.data || {};
  return {
    enabled: d.enabled !== false,
    mutedTypes: Array.isArray(d.mutedTypes) ? d.mutedTypes : [],
    // Derived from the server's code, so the list cannot drift from the types that exist.
    availableTypes: Array.isArray(d.availableTypes) ? d.availableTypes : [],
    updatedAt: d.updatedAt ?? null,
  };
}

export async function saveNotificationSettings(next) {
  const res = await api.put("/admin/notifications/settings", {
    enabled: Boolean(next.enabled),
    mutedTypes: Array.isArray(next.mutedTypes) ? next.mutedTypes : [],
  });
  const d = res.data || {};
  return {
    enabled: d.enabled !== false,
    mutedTypes: Array.isArray(d.mutedTypes) ? d.mutedTypes : [],
    availableTypes: Array.isArray(d.availableTypes) ? d.availableTypes : [],
    updatedAt: d.updatedAt ?? null,
  };
}

export { listNotificationLogs } from "./notifications.service.js";