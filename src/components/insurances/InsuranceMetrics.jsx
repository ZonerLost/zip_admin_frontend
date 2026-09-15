import React from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiShield,
} from "react-icons/fi";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";

export default function InsuranceMetrics({ metrics }) {
  return (
    <MetricsGrid minItemWidth="12rem">
      <MetricCard
        title="Bookings With Insurance"
        value={(metrics?.insuredPct || 0) * 100}
        decimals={1}
        suffix="%"
        icon={FiShield}
      />
      <MetricCard
        title="Bookings Without Insurance"
        value={(metrics?.uninsuredPct || 0) * 100}
        decimals={1}
        suffix="%"
        icon={FiCheckCircle}
      />
      <MetricCard
        title="Insured Bookings"
        value={metrics?.insuredBookings || 0}
        icon={FiCalendar}
      />
      <MetricCard
        title="Insurance Revenue"
        value={metrics?.totalInsuranceRevenue || 0}
        prefix="$"
        decimals={2}
        icon={FiDollarSign}
      />
    </MetricsGrid>
  );
}
