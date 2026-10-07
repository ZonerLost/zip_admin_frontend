import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../ui/Sidebar.jsx";
import Topbar from "../ui/Topbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import * as notifService from "../services/notifications.service.js";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    async function fetchNotifs() {
      try {
        const data = await notifService.getNotifications();
        if (!alive) return;
        setNotifications(data);
      } catch (err) {
        console.warn("Failed to load notifications:", err);
      }
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const refreshNotifications = async () => {
    try {
      const data = await notifService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn("Failed to refresh notifications:", err);
    }
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    await notifService.markNotificationAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    await notifService.markAllNotificationsAsRead(notifications);
  };

  const title = useMemo(() => {
    const p = location.pathname || "/";
    if (p === "/" || p.startsWith("/dashboard")) return "Dashboard";
    if (p.startsWith("/users")) return "Users";
    if (p.startsWith("/listings-discovery")) return "Listings & Discovery";
    if (p.startsWith("/categories-products")) return "Categories & Products";
    if (p.startsWith("/city-development-growth"))
      return "City Development & Growth";
    // if (p.startsWith("/insurances")) return "Insurances";
    if (p.startsWith("/bookings-operations")) return "Bookings & Operations";
    if (p.startsWith("/payments-finance")) return "Payments & Finance";
    if (p.startsWith("/trust-support")) return "Trust & Support";
    if (p.startsWith("/settings")) return "Settings";
    return "Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* spacer to offset fixed sidebar on large screens */}
        <div className="hidden lg:block w-70 shrink-0" />

        <div className="flex-1 min-h-screen min-w-0 overflow-x-hidden">
          <Topbar
            title={title}
            onMenuClick={(e) => {
              // stop the original click from bubbling to the overlay that
              // appears when the sidebar mounts. Open on next tick so the
              // click event finishes before the overlay is mounted.
              try {
                e?.stopPropagation?.();
              } catch {
                // ignore
              }
              setTimeout(() => setSidebarOpen(true), 0);
            }}
            user={user}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onOpenNotifications={refreshNotifications}
          />

          <main className="pt-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
