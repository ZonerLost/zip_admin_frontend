import React from "react";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";
import {
  FiGrid,
  FiCheckCircle,
  FiPauseCircle,
  FiStar,
} from "react-icons/fi";
import TotalListings from "./TotalListings.jsx";
import ActiveListings from "./ActiveListings.jsx";
import AvgViewsPerListing from "./AvgViewsPerListing.jsx";
import AvgViewsPerBoostedItems from "./AvgViewsPerBoostedItems.jsx";
import AvgViewsPerNonBoostedItems from "./AvgViewsPerNonBoostedItems.jsx";
import ViewsPctDifferenceBoostedVsNonBoosted from "./ViewsPctDifferenceBoostedVsNonBoosted.jsx";
import BoostedVsNonBoostedComparison from "./BoostedVsNonBoostedComparison.jsx";
import NumberOfBoostedItems from "./NumberOfBoostedItems.jsx";

export default function ListingsMetrics({ stats }) {
  return (
    <MetricsGrid>
      <MetricCard title="Total Listings" value={stats.total} icon={FiGrid} />
      <MetricCard
        title="Active"
        value={stats.active}
        icon={FiCheckCircle}
        helperText="Items not paused"
      />
      <MetricCard
        title="Boosted Items"
        value={stats.boosted ?? stats.boostedCount ?? 0}
        icon={FiStar}
        helperText="This month"
      />
      <MetricCard
        title="Paused"
        value={stats.paused ?? 0}
        icon={FiPauseCircle}
        helperText="Total"
      />
    </MetricsGrid>
  );
}

export function ListingsCharts() {
  return (
    <div className="mt-4 grid gap-3 grid-cols-1 lg:grid-cols-1">
      <TotalListings />
      <ActiveListings />
      <AvgViewsPerListing />
      <AvgViewsPerBoostedItems />
      <AvgViewsPerNonBoostedItems />
      <BoostedVsNonBoostedComparison />
      <ViewsPctDifferenceBoostedVsNonBoosted />
      <NumberOfBoostedItems />
    </div>
  );
}

export function ListingsMetricsWithCharts(props) {
  return (
    <div>
      <ListingsMetrics {...props} />
      <ListingsCharts />
    </div>
  );
}
