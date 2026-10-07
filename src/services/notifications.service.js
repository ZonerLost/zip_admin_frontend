import { api } from "./apiClient.js";
import { formatRelativeTime } from "../utils/formatters.js";

const READ_STORAGE_KEY = "zip_admin_read_notifications_v1";

function getLocalReadIds() {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLocalReadId(id) {
  try {
    const set = getLocalReadIds();
    set.add(String(id));
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

function saveAllLocalReadIds(ids) {
  try {
    const set = getLocalReadIds();
    ids.forEach((id) => set.add(String(id)));
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

function mapNotificationType(rawType) {
  const map = {
    booking_request: { label: "Booking Request", url: "/bookings-operations" },
    booking_accepted: { label: "Booking Accepted", url: "/bookings-operations" },
    booking_declined: { label: "Booking Declined", url: "/bookings-operations" },
    booking_cancelled: { label: "Booking Cancelled", url: "/bookings-operations" },
    booking_completed: { label: "Booking Completed", url: "/bookings-operations" },
    dispute_opened: { label: "Dispute Opened", url: "/trust-support" },
    dispute_resolved: { label: "Dispute Resolved", url: "/trust-support" },
    payment_received: { label: "Payment Received", url: "/payments-finance" },
    item_added: { label: "Item Listed", url: "/listings-discovery" },
    identity_verified: { label: "Identity Verified", url: "/users" },
    account_created: { label: "Account Created", url: "/users" },
  };

  return map[rawType] || { label: "Notification", url: "/trust-support/notifications" };
}

function normalizeNotification(n, localReadIds) {
  const id = String(n._id || n.id);
  const typeMeta = mapNotificationType(n.type);
  const isRead = Boolean(n.isRead || localReadIds.has(id));

  return {
    id,
    title: n.title || typeMeta.label,
    description: n.body || n.description || "",
    body: n.body || "",
    type: n.type || "general",
    time: formatRelativeTime(n.createdAt),
    createdAt: n.createdAt || new Date().toISOString(),
    unread: !isRead,
    url: n.data?.screen === "dispute_detail" ? "/trust-support" : typeMeta.url,
    data: n.data || {},
    source: "backend",
  };
}

/**
 * Fetch real notifications from the backend API.
 * Combines direct user/admin notifications with live operational alerts.
 */
export async function getNotifications({ page = 1, limit = 20 } = {}) {
  const localReadIds = getLocalReadIds();
  let directNotifications = [];

  // 1. Fetch user notifications from /notifications
  try {
    const res = await api.get(`/notifications?page=${page}&limit=${limit}`);
    const rawList = Array.isArray(res.data) ? res.data : [];
    directNotifications = rawList.map((item) =>
      normalizeNotification(item, localReadIds),
    );
  } catch (err) {
    console.warn("Could not load /notifications feed:", err?.message || err);
  }

  // 2. Fetch live pending operational events for the admin panel
  const operationalAlerts = [];
  try {
    const disputesRes = await api
      .get("/disputes?status=opened&limit=5")
      .catch(() => null);
    if (disputesRes?.data && Array.isArray(disputesRes.data)) {
      disputesRes.data.forEach((disp) => {
        const dispId = `disp_${disp._id || disp.id}`;
        operationalAlerts.push({
          id: dispId,
          title: "Dispute requires attention",
          description: `Dispute opened for booking ${disp.bookingId || disp.booking || "case"}.`,
          type: "case",
          time: formatRelativeTime(disp.createdAt),
          createdAt: disp.createdAt || new Date().toISOString(),
          unread: !localReadIds.has(dispId),
          url: "/trust-support",
          source: "operational",
        });
      });
    }
  } catch {
    // ignore operational alert errors
  }

  // Merge direct and operational notifications, deduplicate by ID, sort by latest
  const mergedMap = new Map();
  [...directNotifications, ...operationalAlerts].forEach((item) => {
    mergedMap.set(item.id, item);
  });

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return merged;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(id) {
  saveLocalReadId(id);

  // If this is a 24-character hex MongoDB ID, sync with backend
  if (/^[a-f\d]{24}$/i.test(String(id))) {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      console.warn("Failed to mark notification read on backend:", err);
    }
  }

  return { ok: true, id };
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(notifications = []) {
  const ids = notifications.map((n) => n.id);
  saveAllLocalReadIds(ids);

  try {
    await api.put("/notifications/read-all");
  } catch (err) {
    console.warn("Failed to mark all read on backend:", err);
  }

  return { ok: true };
}

/**
 * Delete a notification by ID.
 */
export async function deleteNotification(id) {
  if (/^[a-f\d]{24}$/i.test(String(id))) {
    try {
      await api.del(`/notifications/${id}`);
    } catch (err) {
      console.warn("Failed to delete notification on backend:", err);
    }
  }

  return { ok: true, id };
}

/**
 * Platform-wide notification log for the NotificationsPage table.
 *
 * This used to call `GET /notifications`, which is the *signed-in admin's own* feed — so the table
 * showed only their notifications and every "recipient" read "System Admin", because that endpoint
 * has no other user to report. Filtering and search were applied to whatever page had already been
 * fetched, so a match on page two did not exist as far as the UI was concerned.
 *
 * `GET /admin/notifications` is the real log: every notification, recipient populated, with the
 * type filter and search applied by the server across the whole set.
 */
export async function listNotificationLogs({
  q = "",
  type = "all",
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(pageSize));
  if (type && type !== "all") params.set("type", type);
  if (q) params.set("search", q);

  // Deliberately not wrapped in a catch that returns an empty list: swallowing the error made a
  // failed request indistinguishable from "no notifications have ever been sent". The page shows
  // the message instead.
  const res = await api.get(`/admin/notifications?${params.toString()}`);
  const rawList = Array.isArray(res.data) ? res.data : [];

  const rows = rawList.map((n) => {
    const user = n.user && typeof n.user === "object" ? n.user : null;
    const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
    return {
      id: String(n._id || n.id),
      type: mapNotificationType(n.type).label,
      rawType: n.type,
      recipient: name || user?.email || "(deleted user)",
      recipientEmail: user?.email || "",
      // In-app is the only channel that exists; FCM push is still a stub server-side and there is
      // no email or SMS notification path at all. Naming it honestly beats implying three channels.
      channel: "In-app",
      status: n.isRead ? "Read" : "Unread",
      title: n.title || "",
      createdAt: n.createdAt,
    };
  });

  return { rows, total: res.pagination?.total ?? rows.length };
}
