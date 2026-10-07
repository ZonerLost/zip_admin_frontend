import React, { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Pagination from "../../components/shared/Pagination.jsx";

import NotificationsSettingsForm from "../../components/trustSupport/NotificationsSettingsForm.jsx";
import NotificationLogsTable from "../../components/trustSupport/NotificationLogsTable.jsx";

import * as svc from "../../services/trustSupport.service.js";

// Shared with NotificationsSettingsForm; a type the server knows but this map does not still
// appears, under its raw key.
const TYPE_LABELS = {
  booking_request: "Booking request",
  booking_accepted: "Booking accepted",
  booking_declined: "Booking declined",
  booking_cancelled: "Booking cancelled",
  booking_completed: "Booking completed",
  review_received: "Review received",
  message_received: "New chat message",
  dispute_opened: "Dispute opened",
  dispute_resolved: "Dispute resolved",
  payment_received: "Payment received",
  item_added: "Item listed",
  account_created: "Account created",
  identity_verified: "Identity verified",
};

export default function NotificationsPage() {
  const settingsLoadedRef = useRef(false);
  const logsLoadedRef = useRef(false);

  const [settings, setSettings] = useState(null);

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);

  const [error, setError] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsRefreshing, setLogsRefreshing] = useState(false);

  async function loadSettings() {
    if (!settingsLoadedRef.current) {
      setSettingsLoading(true);
    }

    try {
      const response = await svc.getNotificationSettings();
      setSettings(response);
      settingsLoadedRef.current = true;
      setError("");
    } catch (e) {
      setError(e?.message || "Could not load notification settings.");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function loadLogs() {
    const firstLoad = !logsLoadedRef.current;

    if (firstLoad) {
      setLogsLoading(true);
    } else {
      setLogsRefreshing(true);
    }

    try {
      const response = await svc.listNotificationLogs({
        q,
        type,
        page,
        pageSize,
      });

      setLogs(Array.isArray(response?.rows) ? response.rows : []);
      setTotal(Number(response?.total || 0));
      logsLoadedRef.current = true;
      setError("");
    } catch (e) {
      // The service used to swallow this and return an empty list, which made a broken request
      // indistinguishable from a platform that had never sent a notification.
      setLogs([]);
      setTotal(0);
      setError(e?.message || "Could not load the notification log.");
    } finally {
      setLogsLoading(false);
      setLogsRefreshing(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, page, pageSize]);

  async function save(next) {
    // Any failure propagates to the form, which renders it next to the Save button.
    const saved = await svc.saveNotificationSettings(next);
    setSettings(saved);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        subtitle="Choose which notifications the platform sends, and review what it has sent."
        right={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Search logs..."
              className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12 sm:w-70"
            />
            <select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
              className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-50"
            >
              {/* Built from the types the server reports. The old list mixed raw keys with invented
                  labels like "Photo reminder" — a type that has never existed — so most options
                  filtered to nothing. */}
              <option value="all">All types</option>
              {(settings?.availableTypes || []).map((t) => (
                <option key={t.type} value={t.type}>
                  {TYPE_LABELS[t.type] || t.type}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {error ? (
        <Card className="mb-3 border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          {settingsLoading ? (
            <Card className="p-6">
              <p className="text-sm text-neutral-500">
                Loading notification settings...
              </p>
            </Card>
          ) : (
            <NotificationsSettingsForm value={settings} onSave={save} />
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            {logsLoading ? (
              <Card className="p-6">
                <p className="text-sm text-neutral-500">
                  Loading notification logs...
                </p>
              </Card>
            ) : (
              <div
                className={
                  logsRefreshing
                    ? "pointer-events-none opacity-60 transition"
                    : ""
                }
              >
                <NotificationLogsTable rows={logs} />
              </div>
            )}

            {logsRefreshing ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-[1px]">
                <div className="rounded-full border bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm">
                  Updating logs...
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
