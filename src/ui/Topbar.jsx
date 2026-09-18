import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiBell, FiMenu, FiX } from "react-icons/fi";
import { cn } from "../utils/cn.js";
import Button from "../components/shared/Button.jsx";

function useOnClickOutside(ref, handler, when = true) {
  useEffect(() => {
    if (!when) return;

    function listener(e) {
      const el = ref?.current;
      if (!el || el.contains(e.target)) return;
      handler?.();
    }

    window.addEventListener("mousedown", listener);
    window.addEventListener("touchstart", listener);
    return () => {
      window.removeEventListener("mousedown", listener);
      window.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, when]);
}

function defaultNotifications() {
  return [
    {
      id: "n1",
      title: "Photo upload reminder",
      description: "Booking ended — request user to upload evidence photos.",
      time: "2m ago",
      type: "reminder",
      unread: true,
    },
    {
      id: "n2",
      title: "Case status updated",
      description: "Dispute moved to Investigating.",
      time: "1h ago",
      type: "case",
      unread: false,
    },
    {
      id: "n3",
      title: "New report received",
      description: "A listing was reported for policy review.",
      time: "Yesterday",
      type: "moderation",
      unread: true,
    },
  ];
}

function isPhoneViewport() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}

function NotificationItem({ notification, onClick, compact = false }) {
  const { title, description, time, unread } = notification;

  return (
    <button
      className={cn(
        "w-full rounded-2xl text-left transition hover:bg-neutral-50",
        compact
          ? "border bg-white px-3 py-3"
          : "p-3",
        unread && "bg-brand-soft/60",
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
            unread ? "bg-brand" : "bg-neutral-200",
          )}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="pr-2 text-sm font-semibold text-neutral-900">
              {title}
            </p>
            <p className="shrink-0 text-xs text-neutral-500">{time}</p>
          </div>
          <p
            className={cn(
              "mt-1 text-sm text-neutral-600",
              compact ? "line-clamp-3" : "line-clamp-2",
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function Topbar({
  title = "Dashboard",
  subtitle,
  onMenuClick,
  notifications,
  user,
  onOpenNotifications,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);

  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);

  const list = useMemo(() => {
    const src = Array.isArray(notifications)
      ? notifications
      : defaultNotifications();
    return src.slice(0, 8);
  }, [notifications]);

  const unreadCount = useMemo(
    () => list.filter((x) => x.unread).length,
    [list]
  );

  useOnClickOutside(dropdownRef, () => setNotifOpen(false), notifOpen);

  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setMobilePanel(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobilePanel || typeof document === "undefined") return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [mobilePanel]);

  const toggleNotifications = () => {
    if (isPhoneViewport()) {
      const next = !mobilePanel;
      setMobilePanel(next);
      setNotifOpen(false);
      if (next) onOpenNotifications?.();
      return;
    }

    const next = !notifOpen;
    setNotifOpen(next);
    if (next) onOpenNotifications?.();
  };

  const mobileNotificationsPanel =
    mobilePanel && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[200] sm:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobilePanel(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border bg-white shadow-2xl">
              <div className="mt-3 mx-auto h-1.5 w-14 rounded-full bg-neutral-200" />

              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Notifications
                  </p>
                  <p className="text-xs text-neutral-500">
                    {unreadCount ? `${unreadCount} unread` : "All caught up"}
                  </p>
                </div>
                <button
                  className="rounded-xl p-2 hover:bg-neutral-100"
                  onClick={() => setMobilePanel(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-auto px-3 pb-3">
                {list.length === 0 ? (
                  <div className="rounded-2xl border bg-white p-6 text-center">
                    <p className="text-sm font-semibold text-neutral-900">
                      No notifications
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Alerts will appear here (reminders, case updates,
                      moderation).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {list.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        compact
                        onClick={() => setMobilePanel(false)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMobilePanel(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header
        ref={wrapRef}
        className="sticky top-0 z-80 border-b bg-white/90 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-2xl p-2 hover:bg-neutral-100 lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900 sm:text-base">
                {title}
              </p>
              {subtitle ? (
                <p className="truncate text-xs text-neutral-500 sm:text-sm">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                className={cn(
                  "relative inline-flex items-center justify-center rounded-2xl p-2 transition",
                  "hover:bg-neutral-100",
                )}
                onClick={toggleNotifications}
                aria-label="Notifications"
                aria-expanded={isPhoneViewport() ? mobilePanel : notifOpen}
              >
                <FiBell className="h-5 w-5 text-neutral-700" />
                {unreadCount > 0 ? (
                  <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 mt-2 hidden w-90 max-w-[90vw] rounded-2xl border bg-white shadow-xl sm:block">
                  <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Notifications
                      </p>
                      <p className="text-xs text-neutral-500">
                        {unreadCount
                          ? `${unreadCount} unread`
                          : "All caught up"}
                      </p>
                    </div>
                    <button
                      className="rounded-xl p-2 hover:bg-neutral-100"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                    >
                      <FiX />
                    </button>
                  </div>

                  <div className="max-h-85 overflow-auto p-2">
                    {list.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm font-semibold text-neutral-900">
                          No notifications
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Alerts will appear here (reminders, case updates,
                          moderation).
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {list.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onClick={() => setNotifOpen(false)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t px-4 py-3">
                    <Button
                      variant="outline"
                      className="w-full py-2 text-xs"
                      onClick={() => setNotifOpen(false)}
                    >
                      View all notifications
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              className="hidden items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:inline-flex"
              onClick={() => navigate("/settings")}
            >
              <span className="h-7 w-7 rounded-full bg-brand-soft" />
              <span className="max-w-35 truncate">{user?.name || "Admin"}</span>
            </button>
          </div>
        </div>
      </header>

      {mobileNotificationsPanel}
    </>
  );
}
