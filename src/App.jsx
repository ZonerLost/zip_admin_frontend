import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import UsersPage from "./pages/users/UsersPage.jsx";
import TrustSupportPage from "./pages/trust-support/TrustSupportPage.jsx";
import ListingsDiscoveryPage from "./pages/listings-discovery/ListingsDiscoveryPage.jsx";
import CategoriesProductsPage from "./pages/categories-products/CategoriesProductsPage.jsx";
import CityDevelopmentGrowthPage from "./pages/city-development-growth/CityDevelopmentGrowthPage.jsx";
import InsurancesPage from "./pages/insurances/InsurancesPage.jsx";
import BookingsOperationsPage from "./pages/bookings-operations/BookingsOperationsPage.jsx";
import PaymentsFinancePage from "./pages/payments-finance/PaymentsFinancePage.jsx";
import NotificationsPage from "./pages/trust-support/NotificationsPage.jsx";
import SettingsPage from "./pages/settings/SettingsPage.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";

// Use the real LoginPage for authentication flows

function DashboardPlaceholder() {
  return <div className="p-6">Dashboard Page (build later)</div>;
}
function UsersPlaceholder() {
  return <div className="p-6">Users Page (build later)</div>;
}
function ListingsDiscoveryPlaceholder() {
  return <div className="p-6">Listings & Discovery Page (build later)</div>;
}
function BookingsOperationsPlaceholder() {
  return <div className="p-6">Bookings & Operations Page (build later)</div>;
}
function PaymentsFinancePlaceholder() {
  return <div className="p-6">Payments & Finance Page (build later)</div>;
}

export default function App() {
  return (
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
          <Route
            path="/city-development-growth"
            element={<CityDevelopmentGrowthPage />}
          />
          <Route path="/insurances" element={<InsurancesPage />} />
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
  );
}
