import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const UsersPage = lazy(() => import("./pages/users/UsersPage.jsx"));
const ListingsDiscoveryPage = lazy(
  () => import("./pages/listings-discovery/ListingsDiscoveryPage.jsx"),
);
const CategoriesProductsPage = lazy(
  () => import("./pages/categories-products/CategoriesProductsPage.jsx"),
);
// const CityDevelopmentGrowthPage = lazy(
//   () => import("./pages/city-development-growth/CityDevelopmentGrowthPage.jsx"),
// );
// const InsurancesPage = lazy(
//   () => import("./pages/insurances/InsurancesPage.jsx"),
// );
const BookingsOperationsPage = lazy(
  () => import("./pages/bookings-operations/BookingsOperationsPage.jsx"),
);
const PaymentsFinancePage = lazy(
  () => import("./pages/payments-finance/PaymentsFinancePage.jsx"),
);
const TrustSupportPage = lazy(
  () => import("./pages/trust-support/TrustSupportPage.jsx"),
);
const NotificationsPage = lazy(
  () => import("./pages/trust-support/NotificationsPage.jsx"),
);
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage.jsx"));

function PageLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <span className="text-xs font-medium text-neutral-500">
          Loading module...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "0.75rem",
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "0.875rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            maxWidth: "420px",
            padding: "10px 16px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route
                path="/listings-discovery"
                element={<ListingsDiscoveryPage />}
              />
              <Route
                path="/categories-products"
                element={<Navigate to="/categories-products/overall-products" replace />}
              />
              <Route
                path="/categories-products/:section"
                element={<CategoriesProductsPage />}
              />
              <Route
                path="/products"
                element={<Navigate to="/categories-products/overall-products" replace />}
              />
              {/* <Route
                path="/city-development-growth"
                element={<CityDevelopmentGrowthPage />}
              /> */}
              {/* <Route path="/insurances" element={<InsurancesPage />} /> */}
              <Route
                path="/bookings-operations"
                element={<BookingsOperationsPage />}
              />
              <Route path="/payments-finance" element={<PaymentsFinancePage />} />

              <Route path="/trust-support" element={<TrustSupportPage />} />
              <Route
                path="/trust-support/notifications"
                element={<NotificationsPage />}
              />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
