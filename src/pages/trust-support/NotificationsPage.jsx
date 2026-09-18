import React, { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Pagination from "../../components/shared/Pagination.jsx";

import NotificationsSettingsForm from "../../components/trustSupport/NotificationsSettingsForm.jsx";
import NotificationLogsTable from "../../components/trustSupport/NotificationLogsTable.jsx";

import * as svc from "../../services/trustSupport.service.js";

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
    await svc.saveNotificationSettings(next);
    await Promise.all([loadSettings(), loadLogs()]);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        subtitle="Manage reminders (photo uploads) and case progress updates."
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
              <option value="all">All Types</option>
              <option value="PhotoUploadReminder">PhotoUploadReminder</option>
              <option value="CaseProgressUpdate">CaseProgressUpdate</option>
              <option value="SettingsUpdate">SettingsUpdate</option>
            </select>
          </div>
        }
      />

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
