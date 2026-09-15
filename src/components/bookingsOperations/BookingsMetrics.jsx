import React from "react";
import MetricCard from "../shared/MetricCard.jsx";
import MetricsGrid from "../shared/MetricsGrid.jsx";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import TotalBookings from "./TotalBookings.jsx";
import AmountOfRequests from "./AmountOfRequests.jsx";
import AvgResponseTime from "./AvgResponseTime.jsx";
import AmountAccepted from "./AmountAccepted.jsx";
import AmountInstantBooking from "./AmountInstantBooking.jsx";
import AmountNotAccepted from "./AmountNotAccepted.jsx";
import AvgBookingPerListingNonBoosted from "./AvgBookingPerListingNonBoosted.jsx";
import AvgBookingPerBoosted from "./AvgBookingPerBoosted.jsx";
import PctDiffBoostedVsNonBoosted from "./PctDiffBoostedVsNonBoosted.jsx";

export default function BookingsMetrics({ stats }) {
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
