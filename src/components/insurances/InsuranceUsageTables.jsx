import React, { useMemo } from "react";
import Card from "../shared/Card.jsx";
import SortableAnalyticsTable from "../shared/SortableAnalyticsTable.jsx";

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function UsageTableCard({ title, subtitle, rows, columns, defaultSort }) {
  return (
    <Card className="p-0">
      <div className="border-b p-4">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
      </div>
      <div className="p-4">
        <SortableAnalyticsTable
          tableKey={title}
          rows={rows}
          columns={columns}
          emptyText={`No ${title.toLowerCase()} data in this range.`}
          defaultSort={defaultSort}
          paginated
        />
      </div>
    </Card>
  );
}

export default function InsuranceUsageTables({
  categoryUsage = [],
  subCategoryUsage = [],
  productUsage = [],
  planUsage = [],
}) {
  const usageColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        minWidth: 180,
        sortValue: (row) => row.name,
      },
      {
        key: "totalBookings",
        header: "Bookings",
        align: "right",
        sortValue: (row) => row.totalBookings,
        render: (row) => formatNumber(row.totalBookings),
      },
      {
        key: "insuredBookings",
        header: "With insurance",
        align: "right",
        sortValue: (row) => row.insuredBookings,
        render: (row) => formatNumber(row.insuredBookings),
      },
      {
        key: "usageRate",
        header: "Usage rate",
        align: "right",
        sortValue: (row) => row.usageRate,
        render: (row) => formatPercent(row.usageRate),
      },
      {
        key: "insuranceRevenue",
        header: "Revenue",
        align: "right",
        sortValue: (row) => row.insuranceRevenue,
        render: (row) => formatMoney(row.insuranceRevenue),
      },
    ],
    [],
  );

  const planColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Plan",
        minWidth: 180,
        sortValue: (row) => row.name,
      },
      {
        key: "pricing",
        header: "Pricing",
        minWidth: 160,
        sortValue: (row) => row.pricing,
      },
      {
        key: "bookings",
        header: "Bookings",
        align: "right",
        sortValue: (row) => row.bookings,
        render: (row) => formatNumber(row.bookings),
      },
      {
        key: "revenue",
        header: "Revenue",
        align: "right",
        sortValue: (row) => row.revenue,
        render: (row) => formatMoney(row.revenue),
      },
    ],
    [],
  );

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <UsageTableCard
        title="Highest Insurance Usage by Category"
        subtitle="Categories with the highest insured-booking share."
        rows={categoryUsage}
        columns={usageColumns}
        defaultSort={{ key: "usageRate", direction: "desc" }}
      />
      <UsageTableCard
        title="Highest Insurance Usage by Sub-category"
        subtitle="Sub-categories with the highest insured-booking share."
        rows={subCategoryUsage}
        columns={usageColumns}
        defaultSort={{ key: "usageRate", direction: "desc" }}
      />
      <UsageTableCard
        title="Highest Insurance Usage by Product"
        subtitle="Specific products driving the most insurance uptake."
        rows={productUsage}
        columns={usageColumns}
        defaultSort={{ key: "usageRate", direction: "desc" }}
      />
      <UsageTableCard
        title="Top Insurance Plans"
        subtitle="Plans ranked by insured bookings in the selected range."
        rows={planUsage}
        columns={planColumns}
        defaultSort={{ key: "bookings", direction: "desc" }}
      />
    </div>
  );
}
