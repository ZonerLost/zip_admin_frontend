import React from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";
import {
  FiUsers,
  FiBox,
  FiCalendar,
  FiAlertTriangle,
  FiDollarSign,
  FiGlobe,
} from "react-icons/fi";

export default function DashboardMetrics({ data, prevData }) {
  const navigate = useNavigate();

  const go = (path) => () => navigate(path);

  return (
    <MetricsGrid className="gap-2 sm:gap-3">
      <MetricCard
        title="Users"
        value={data.users}
        helperText={
          prevData ? formatDelta(prevData.users, data.users) : undefined
        }
        icon={FiUsers}
        onClick={go("/users")}
      />
      <MetricCard
        title="Active Listings"
        value={data.listings}
        helperText={
          prevData ? formatDelta(prevData.listings, data.listings) : undefined
        }
        icon={FiBox}
        onClick={go("/listings-discovery")}
      />
      <MetricCard
        title="Bookings"
        value={data.bookings}
        helperText={
          prevData ? formatDelta(prevData.bookings, data.bookings) : undefined
        }
        icon={FiCalendar}
        onClick={go("/bookings-operations")}
      />
      <MetricCard
        title="Open Disputes"
        value={data.disputes}
        helperText={
          prevData ? formatDelta(prevData.disputes, data.disputes) : undefined
        }
        icon={FiAlertTriangle}
        onClick={go("/trust-support")}
      />
      <MetricCard
        title="Revenue"
        value={data.revenue}
        helperText={
          prevData
            ? formatDelta(prevData.revenue, data.revenue, true)
            : undefined
        }
        icon={FiDollarSign}
        prefix="$"
        decimals={2}
        onClick={go("/payments-finance")}
      />
      <MetricCard
        title="CO₂ Saved"
        value={data.co2SavedKg}
        helperText={
          prevData
            ? formatDelta(prevData.co2SavedKg, data.co2SavedKg, true)
            : undefined
        }
        icon={FiGlobe}
        suffix=" kg"
        decimals={1}
        onClick={go("/listings-discovery")}
      />
    </MetricsGrid>
  );
}

function formatDelta(prev, current, isCurrency = false) {
  if (prev == null || current == null) return undefined;
  const diff = current - prev;
  const pct =
    prev === 0 ? (diff === 0 ? 0 : 100) : Math.round((diff / prev) * 100);
  const sign = diff > 0 ? "+" : "";
  const formatted = isCurrency
    ? `${sign}${formatNumber(current - prev, 2)}`
    : `${sign}${diff}`;
  return `${formatted} (${sign}${pct}%) vs prev`;
}

function formatNumber(n, decimals = 0) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}
