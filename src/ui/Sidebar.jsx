import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiBox,
  FiChevronDown,
  FiChevronRight,
  FiMapPin,
  FiHome,
  FiUsers,
  FiGrid,
  FiCalendar,
  FiCreditCard,
  FiShield,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import { cn } from "../utils/cn.js";
import AtussaLogo from "../components/brand/AtussaLogo.jsx";

const NAV = [
  { label: "Dashboard", path: "/dashboard", icon: FiHome },
  { label: "Users", path: "/users", icon: FiUsers },
  { label: "Listings & Discovery", path: "/listings-discovery", icon: FiGrid },
  {
    label: "Products",
    path: "/categories-products/overall-products",
    icon: FiBox,
  },
  // {
  //   label: "City Development & Growth",
  //   path: "/city-development-growth",
  //   icon: FiMapPin,
  // },
  // {
  //   label: "Insurances",
  //   path: "/insurances",
  //   icon: FiShield,
  // },
  {
    label: "Bookings & Operations",
    path: "/bookings-operations",
    icon: FiCalendar,
  },
  {
    label: "Payments & Finance",
    path: "/payments-finance",
    icon: FiCreditCard,
  },
  { label: "Trust & Support", path: "/trust-support", icon: FiShield },
  { label: "Settings", path: "/settings", icon: FiSettings },
];

function isNavItemActive(item, pathname) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  return (
    pathname === item.path ||
    pathname.startsWith(`${item.path}/`) ||
    (hasChildren &&
      item.children.some(
        (child) =>
          pathname === child.path || pathname.startsWith(`${child.path}/`),
      ))
  );
}

function SidebarInner({ onNavigate, onLogout }) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(
      NAV.filter((item) => Array.isArray(item.children) && item.children.length)
        .map((item) => [item.path, isNavItemActive(item, location.pathname)]),
    ),
  );

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    let changed = false;
    const next = { ...expandedGroups };

    NAV.forEach((item) => {
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
      if (!hasChildren) return;

      if (
        isNavItemActive(item, location.pathname) &&
        !expandedGroups[item.path]
      ) {
        next[item.path] = true;
        changed = true;
      }
    });

    if (changed) {
      setExpandedGroups(next);
    }
  }

  function toggleGroup(path) {
    setExpandedGroups((current) => ({
      ...current,
      [path]: !current[path],
    }));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-6">
        <AtussaLogo variant="horizontal" className="h-9 w-auto" />
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
          Admin console
        </p>
      </div>

      <div className="px-3">
        <div className="h-px bg-line" />
      </div>

      <nav className="flex-1 overflow-auto px-3 py-4">
        <div className="space-y-1">
          {NAV.map((item) => {
            const IconComponent = item.icon;
            const hasChildren =
              Array.isArray(item.children) && item.children.length > 0;
            const isGroupActive = isNavItemActive(item, location.pathname);
            const isExpanded = hasChildren ? !!expandedGroups[item.path] : false;

            return (
              <div key={item.path}>
                {hasChildren ? (
                  <div
                    className={cn(
                      "rounded-2xl transition",
                      isGroupActive
                        ? "bg-brand-soft text-brand"
                        : "text-neutral-700 hover:bg-neutral-50",
                    )}
                  >
                    <div className="flex items-center gap-2 px-3 py-3">
                      <NavLink
                        to={item.path}
                        onClick={() => onNavigate?.()}
                        className="flex min-w-0 flex-1 items-center gap-3 text-sm font-medium"
                      >
                        <IconComponent className="h-5 w-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>

                      <button
                        type="button"
                        onClick={() => toggleGroup(item.path)}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.label}`}
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition",
                          isGroupActive
                            ? "hover:bg-sage/30"
                            : "hover:bg-neutral-100",
                        )}
                      >
                        {isExpanded ? (
                          <FiChevronDown className="h-4 w-4" />
                        ) : (
                          <FiChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => onNavigate?.()}
                    className={() =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                        "hover:bg-neutral-50",
                        isGroupActive
                          ? "bg-brand-soft text-brand"
                          : "text-neutral-700",
                      )
                    }
                  >
                    <IconComponent className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                )}

                {hasChildren && isExpanded ? (
                  <div className="ml-7 mt-2 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-2">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={() => onNavigate?.()}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                            isActive
                              ? "bg-white font-semibold text-brand shadow-sm"
                              : "text-neutral-500 hover:bg-white hover:text-neutral-700",
                          )
                        }
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full bg-neutral-300",
                            location.pathname === child.path
                              ? "bg-brand"
                              : "",
                          )}
                        />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="px-3 pb-6">
        <div className="mt-auto px-1">
          <button
            onClick={() => onLogout?.()}
            className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <FiLogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open = false, onClose, onLogout }) {
  useEffect(() => {
    if (!open) return;
    const closeOnEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, [open, onClose]);

  const navigate = useNavigate();

  function handleLogout() {
    if (onLogout) {
      onLogout();
    } else {
      try {
        localStorage.clear();
      } catch (err) {
        console.error(err);
      }
      navigate("/login", { replace: true });
    }
    onClose?.();
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-70 lg:block border-r bg-white">
        <SidebarInner onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-120 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] border-r bg-white shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-sm font-semibold text-neutral-900">Menu</p>
              <button
                className="rounded-xl p-2 hover:bg-neutral-100"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <FiX />
              </button>
            </div>
            <div className="h-px bg-line" />
            <SidebarInner onNavigate={onClose} onLogout={handleLogout} />
          </div>
        </div>
      ) : null}
    </>
  );
}
