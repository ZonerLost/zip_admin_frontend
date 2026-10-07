import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
              element={<Navigate to="/categories-products/categories" replace />}
            />
            <Route
              path="/categories-products/:section"
              element={<CategoriesProductsPage />}
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
  );
}
