import React from "react";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";
import {
  FiAlertTriangle,
  FiClock,
  FiSearch,
  FiCheckCircle,
  FiImage,
} from "react-icons/fi";

export default function DisputesMetrics({ stats }) {
  return (
    <MetricsGrid>
      <MetricCard
        title="Total Disputes"
        value={stats.total}
        icon={FiAlertTriangle}
      />
      <MetricCard title="Open" value={stats.open} icon={FiClock} />
      <MetricCard
        title="Investigating"
        value={stats.investigating}
        icon={FiSearch}
      />
      <MetricCard
        title="Resolved"
        value={stats.resolved}
        icon={FiCheckCircle}
      />
      <MetricCard
        title="Evidence Pending"
        value={stats.evidencePending}
        icon={FiImage}
      />
    </MetricsGrid>
  );
}
