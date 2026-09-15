import React from "react";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import DashboardMetrics from "../../components/dashboard/DashboardMetrics.jsx";
import SustainabilitySnapshot from "../../components/dashboard/SustainabilitySnapshot.jsx";
import Card from "../../components/shared/Card.jsx";

import BookingsRevenueChart from "../../components/dashboard/BookingsRevenueChart.jsx";
import DisputesTrendChart from "../../components/dashboard/bookings.jsx";
import LeaderboardTable from "../../components/dashboard/LeaderboardTable.jsx";
import { DashboardRangeProvider } from "../../context/DashboardRangeContext.jsx";
import RangeSelector from "../../components/dashboard/RangeSelector.jsx";

import * as dashboardService from "../../services/dashboard.service.js";

export default function DashboardPage() {
  // DashboardRangeProvider must wrap any component that calls useDashboardRange.
  // To avoid calling the hook before the provider is mounted, move the
  // context-consuming logic into an inner component that is rendered inside
  // the provider.
  return (
    <DashboardRangeProvider>
      <PageContainer>
        <PageHeader title="Dashboard" right={<RangeSelector />} />
        <DashboardContent />
      </PageContainer>
    </DashboardRangeProvider>
  );
}

function DashboardContent() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();

  const [data, setData] = React.useState(null);
  const [prevData, setPrevData] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      // when no resolvedRange available, fall back to legacy summary
      if (!resolvedRange) {
        const [summary, leaderboards] = await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getLeaderboards(),
        ]);
        if (!alive) return;
        setData({ ...summary, leaderboards });
        setPrevData(null);
        return;
      }

      const [summary, leaderboards] = await Promise.all([
        dashboardService.getDashboardSummary(
          resolvedRange.start,
          resolvedRange.end,
        ),
        dashboardService.getLeaderboards(),
      ]);

      if (!alive) return;
      setData({ ...summary, leaderboards });

      if (comparePreviousYear) {
        const prev = resolvePreviousYear();
        if (prev) {
          const prevSummary = await dashboardService.getDashboardSummary(
            prev.start,
            prev.end,
          );
          if (!alive) return;
          setPrevData(prevSummary);
        } else {
          setPrevData(null);
        }
      } else {
        setPrevData(null);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [resolvedRange, comparePreviousYear, resolvePreviousYear]);

  return (
    <>
      {!data ? (
        <Card className="p-6">
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <DashboardMetrics data={data} prevData={prevData} />

          <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
            <div className="lg:col-span-1 h-full">
              <BookingsRevenueChart />
            </div>

            <div className="lg:col-span-1 h-full">
              <DisputesTrendChart />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-1">
            <SustainabilitySnapshot co2SavedKg={data.co2SavedKg} />
          </div>

          <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
            <LeaderboardTable
              title="Top Users"
              rows={data.leaderboards.topUsers}
            />
            <LeaderboardTable
              title="Top Cities"
              rows={data.leaderboards.topCities.map((c) => ({
                ...c,
                city: c.name,
                name: c.name,
              }))}
            />
          </div>
        </div>
      )}
    </>
  );
}
