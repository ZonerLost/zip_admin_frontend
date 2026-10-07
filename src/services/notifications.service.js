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
 * Audit log feed for the NotificationsPage table.
 */
export async function listNotificationLogs({
  q = "",
  type = "all",
  page = 1,
  pageSize = 10,
} = {}) {
  try {
    const res = await api.get(`/notifications?page=${page}&limit=${pageSize}`);
    const rawList = Array.isArray(res.data) ? res.data : [];
    const total = res.pagination?.total ?? rawList.length;

    let rows = rawList.map((n) => {
      const typeMeta = mapNotificationType(n.type);
      return {
        id: String(n._id || n.id),
        type: typeMeta.label,
        recipient: n.user?.email || n.user?.name || "System Admin",
        channel: "In-app Push",
        status: n.isRead ? "Read" : "Delivered",
        createdAt: n.createdAt,
      };
    });

    if (q) {
      const query = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.type.toLowerCase().includes(query) ||
          r.recipient.toLowerCase().includes(query) ||
          r.status.toLowerCase().includes(query),
      );
    }

    if (type && type !== "all") {
      rows = rows.filter((r) => r.type.toLowerCase() === type.toLowerCase());
    }

    return { rows, total };
  } catch {
    return { rows: [], total: 0 };
  }
}
