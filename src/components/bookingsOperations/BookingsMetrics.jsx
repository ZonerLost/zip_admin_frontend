import React from "react";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiZap,
} from "react-icons/fi";
import TotalBookings from "./TotalBookings.jsx";
import AmountOfRequests from "./AmountOfRequests.jsx";
import AvgResponseTime from "./AvgResponseTime.jsx";
import AmountAccepted from "./AmountAccepted.jsx";
import AmountInstantBooking from "./AmountInstantBooking.jsx";
import AmountNotAccepted from "./AmountNotAccepted.jsx";
import AvgBookingPerListingNonBoosted from "./AvgBookingPerListingNonBoosted.jsx";
import AvgBookingPerBoosted from "./AvgBookingPerBoosted.jsx";
import PctDiffBoostedVsNonBoosted from "./PctDiffBoostedVsNonBoosted.jsx";


function splitCard(splits, a, b) {
  if (!splits) return { displayValue: "—", helperText: "Loading…" };
  if (splits.error) return { displayValue: "—", helperText: "Unavailable" };
  const x = splits[a] || 0;
  const y = splits[b] || 0;
  if (!x && !y) {
    return { displayValue: "—", helperText: "No bookings in selected range" };
  }
  const xPct = Math.round((x / (x + y)) * 100);
  return {
    displayValue: `${xPct}% / ${100 - xPct}%`,
    helperText: `${x} ${a} · ${y} ${b} (selected range)`,
  };
}

export default function BookingsMetrics({ stats, splits }) {
  return (
    <MetricsGrid>
      <MetricCard
        title="Total Bookings"
        value={stats.total}
        icon={FiCalendar}
      />
      <MetricCard title="Pending" value={stats.pending} icon={FiClock} />
      <MetricCard
        title="Approved"
        value={stats.approved}
        icon={FiCheckCircle}
      />
      <MetricCard title="Cancelled" value={stats.cancelled} icon={FiXCircle} />
      <MetricCard
        title="Delivery vs Pickup"
        icon={FiTruck}
        {...splitCard(splits, "delivery", "pickup")}
      />
      <MetricCard
        title="Instant vs Request"
        icon={FiZap}
        {...splitCard(splits, "instant", "request")}
      />
    </MetricsGrid>
  );
}

export function BookingsCharts(props) {
  const { start, end, comparePrev, prevStart, prevEnd } = props || {};

  return (
    <div className="mt-4 grid gap-3 grid-cols-1 lg:grid-cols-1">
      <TotalBookings
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <AmountOfRequests
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <AvgResponseTime
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <AmountAccepted
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <AmountInstantBooking
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <AmountNotAccepted
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <AvgBookingPerListingNonBoosted
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <AvgBookingPerBoosted
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
      <PctDiffBoostedVsNonBoosted
        start={start}
        end={end}
        comparePrev={comparePrev}
        prevStart={prevStart}
        prevEnd={prevEnd}
      />
    </div>
  );
}

export function BookingsMetricsWithCharts(props) {
  const { stats } = props || {};
  return (
    <div>
      <BookingsMetrics stats={stats} />
      <BookingsCharts {...props} />
    </div>
  );
}
