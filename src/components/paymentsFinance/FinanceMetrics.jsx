import React from "react";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";
import {
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";

export default function FinanceMetrics({ stats }) {
  return (
    <MetricsGrid>
      <MetricCard
        title="Transactions"
        value={stats.total}
        icon={FiCreditCard}
      />
      <MetricCard
        title="Revenue (Fees)"
        value={stats.fees}
        icon={FiTrendingUp}
        prefix="$"
        decimals={2}
      />
      <MetricCard
        title="Payouts"
        value={stats.payouts}
        icon={FiDollarSign}
        prefix="$"
        decimals={2}
      />
      <MetricCard
        title="Refunds"
        value={stats.refunds}
        icon={FiRefreshCw}
        prefix="$"
        decimals={2}
      />
      <MetricCard title="Pending" value={stats.pending} icon={FiClock} />
    </MetricsGrid>
  );
}
