import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import SortableAnalyticsTable from "../categoriesProducts/SortableAnalyticsTable.jsx";

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function formatPerCapita(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function formatPercent(value) {
  const numeric = Number(value || 0) * 100;
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(1)}%`;
}


function GrowthCell({ value }) {
  const numeric = Number(value || 0);
  const colorClass =
    numeric > 0
      ? "text-emerald-600"
      : numeric < 0
        ? "text-rose-600"
        : "text-neutral-600";

  return (
    <span className={`font-medium ${colorClass}`}>
      {formatPercent(numeric)}
    </span>
  );
}

function buildColumns() {
  return [
    {
      key: "cityName",
      header: "City",
      minWidth: 180,
      sortValue: (row) => row.cityName,
    },
    {
      key: "region",
      header: "Country / Province / State",
      minWidth: 220,
      sortValue: (row) => row.region,
    },
    {
      key: "totalUsers",
      header: "Total users",
      align: "right",
      sortValue: (row) => row.totalUsers,
      render: (row) => formatNumber(row.totalUsers),
    },
    {
      key: "usersPerCapita",
      header: "Users per capita",
      align: "right",
      sortValue: (row) => row.usersPerCapita,
      render: (row) => formatPerCapita(row.usersPerCapita),
    },
    {
      key: "totalListings",
      header: "Total listings",
      align: "right",
      sortValue: (row) => row.totalListings,
      render: (row) => formatNumber(row.totalListings),
    },
    {
      key: "totalBookings",
      header: "Total bookings",
      align: "right",
      sortValue: (row) => row.totalBookings,
      render: (row) => formatNumber(row.totalBookings),
    },
    {
      key: "activeUsers",
      header: "Active users",
      align: "right",
      sortValue: (row) => row.activeUsers,
      render: (row) => formatNumber(row.activeUsers),
    },
    {
      key: "topCategories",
      header: "Top categories",
      minWidth: 240,
      sortValue: (row) => row.topCategories,
    },
    {
      key: "topSubCategories",
      header: "Top sub-categories",
      minWidth: 260,
      sortValue: (row) => row.topSubCategories,
    },
    {
      key: "topProducts",
      header: "Top product types",
      minWidth: 220,
      sortValue: (row) => row.topProducts,
    },
    {
      key: "userGrowthPct",
      header: "User growth",
      align: "right",
      sortValue: (row) => row.userGrowthPct,
      render: (row) => <GrowthCell value={row.userGrowthPct} />,
    },
    {
      key: "listingGrowthPct",
      header: "Listing growth",
      align: "right",
      sortValue: (row) => row.listingGrowthPct,
      render: (row) => <GrowthCell value={row.listingGrowthPct} />,
    },
    {
      key: "bookingGrowthPct",
      header: "Booking growth",
      align: "right",
      sortValue: (row) => row.bookingGrowthPct,
      render: (row) => <GrowthCell value={row.bookingGrowthPct} />,
    },
  ];
}

export default function CityOverviewTable({
  rows = [],
  loading = false,
  rangeLabel = "Last 7 days",
}) {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <Card className="mt-4 p-0">
      <div className="border-b p-4">
        <p className="text-sm font-semibold text-neutral-900">City overview</p>
        <p className="mt-1 text-xs text-neutral-500">
          One row per city with adoption, growth, and popularity metrics.
        </p>
      </div>

      <div className="border-b px-4 py-3 text-xs font-medium text-neutral-500">
        Showing: {rangeLabel}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="rounded-2xl border bg-white px-4 py-8 text-sm text-neutral-500">
            Loading city overview...
          </div>
        ) : (
          <SortableAnalyticsTable
            tableKey="city_overview"
            rows={rows}
            columns={columns}
            emptyText="No city growth data available for this range."
            defaultSort={{ key: "totalUsers", direction: "desc" }}
            scrollable
            mobileCards
            paginated
          />
        )}
      </div>
    </Card>
  );
}
