import React, { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, useParams } from "react-router-dom";
import {
  FiBox,
  FiCalendar,
  FiDollarSign,
  FiGrid,
} from "react-icons/fi";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import MetricCard from "../../components/shared/MetricCard.jsx";
import MetricsGrid from "../../components/shared/MetricsGrid.jsx";
import SortableAnalyticsTable from "../../components/categoriesProducts/SortableAnalyticsTable.jsx";
import RangeSelector from "../../components/dashboard/RangeSelector.jsx";
import { DashboardRangeProvider } from "../../context/DashboardRangeContext.jsx";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import { formatMoney } from "../../utils/formatters.js";
import * as svc from "../../services/categoriesProducts.service.js";

const SECTION_CONFIG = {
  categories: {
    label: "Categories",
    subtitle: "Marketplace performance by top-level category.",
    emptyText: "No category analytics available for this range.",
    metricLabel: "Tracked categories",
    rowsKey: "categories",
    defaultSort: { key: "revenue", direction: "desc" },
  },
  "sub-categories": {
    label: "Sub-categories",
    subtitle: "Performance signals by sub-category.",
    emptyText: "No sub-category analytics available for this range.",
    metricLabel: "Tracked sub-categories",
    rowsKey: "subCategories",
    defaultSort: { key: "revenue", direction: "desc" },
  },
  "overall-products": {
    label: "Overall products",
    subtitle:
      "Product-type performance across listings, views, bookings, and reviews.",
    emptyText: "No product analytics available for this range.",
    metricLabel: "Tracked product types",
    rowsKey: "products",
    defaultSort: { key: "revenue", direction: "desc" },
  },
};

const SUBMODULE_LINKS = [
  { label: "Categories", to: "/categories-products/categories" },
  { label: "Sub-categories", to: "/categories-products/sub-categories" },
  { label: "Overall products", to: "/categories-products/overall-products" },
];

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatDays(value) {
  return `${Number(value || 0).toFixed(1)} days`;
}

function formatRating(value) {
  return Number(value || 0).toFixed(2);
}

function buildColumns(section) {
  if (section === "categories") {
    return [
      {
        key: "name",
        header: "Category",
        minWidth: 220,
        sortValue: (row) => row.name,
      },
      {
        key: "totalItems",
        header: "Items",
        align: "right",
        sortValue: (row) => row.totalItems,
        render: (row) => formatNumber(row.totalItems),
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
      {
        key: "boostedItems",
        header: "Boosted items",
        align: "right",
        sortValue: (row) => row.boostedItems,
        render: (row) => formatNumber(row.boostedItems),
      },
      {
        key: "leadTimeDays",
        header: "Avg lead time",
        align: "right",
        sortValue: (row) => row.leadTimeDays,
        render: (row) => formatDays(row.leadTimeDays),
      },
      {
        key: "totalViews",
        header: "Views",
        align: "right",
        sortValue: (row) => row.totalViews,
        render: (row) => formatNumber(row.totalViews),
      },
      {
        key: "conversionRate",
        header: "Conversion",
        align: "right",
        sortValue: (row) => row.conversionRate,
        render: (row) => formatPercent(row.conversionRate),
      },
      {
        key: "boostedRate",
        header: "Boosted %",
        align: "right",
        sortValue: (row) => row.boostedRate,
        render: (row) => formatPercent(row.boostedRate),
      },
      {
        key: "avgRentalDuration",
        header: "Avg rental duration",
        align: "right",
        sortValue: (row) => row.avgRentalDuration,
        render: (row) => formatDays(row.avgRentalDuration),
      },
      {
        key: "availabilityRate",
        header: "Availability",
        align: "right",
        sortValue: (row) => row.availabilityRate,
        render: (row) => formatPercent(row.availabilityRate),
      },
      {
        key: "avgRating",
        header: "Avg rating",
        align: "right",
        sortValue: (row) => row.avgRating,
        render: (row) => formatRating(row.avgRating),
      },
      {
        key: "reviews",
        header: "Reviews",
        align: "right",
        sortValue: (row) => row.reviews,
        render: (row) => formatNumber(row.reviews),
      },
    ];
  }

  if (section === "sub-categories") {
    return [
      {
        key: "name",
        header: "Sub-category",
        minWidth: 220,
        sortValue: (row) => row.name,
      },
      {
        key: "totalItems",
        header: "Items",
        align: "right",
        sortValue: (row) => row.totalItems,
        render: (row) => formatNumber(row.totalItems),
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
      {
        key: "boostedItems",
        header: "Boosted items",
        align: "right",
        sortValue: (row) => row.boostedItems,
        render: (row) => formatNumber(row.boostedItems),
      },
      {
        key: "leadTimeDays",
        header: "Avg lead time",
        align: "right",
        sortValue: (row) => row.leadTimeDays,
        render: (row) => formatDays(row.leadTimeDays),
      },
      {
        key: "totalViews",
        header: "Views",
        align: "right",
        sortValue: (row) => row.totalViews,
        render: (row) => formatNumber(row.totalViews),
      },
      {
        key: "conversionRate",
        header: "Conversion",
        align: "right",
        sortValue: (row) => row.conversionRate,
        render: (row) => formatPercent(row.conversionRate),
      },
      {
        key: "boostedRate",
        header: "Boosted %",
        align: "right",
        sortValue: (row) => row.boostedRate,
        render: (row) => formatPercent(row.boostedRate),
      },
      {
        key: "avgRentalDuration",
        header: "Avg rental duration",
        align: "right",
        sortValue: (row) => row.avgRentalDuration,
        render: (row) => formatDays(row.avgRentalDuration),
      },
      {
        key: "availabilityRate",
        header: "Availability",
        align: "right",
        sortValue: (row) => row.availabilityRate,
        render: (row) => formatPercent(row.availabilityRate),
      },
      {
        key: "avgRating",
        header: "Avg rating",
        align: "right",
        sortValue: (row) => row.avgRating,
        render: (row) => formatRating(row.avgRating),
      },
      {
        key: "reviews",
        header: "Reviews",
        align: "right",
        sortValue: (row) => row.reviews,
        render: (row) => formatNumber(row.reviews),
      },
    ];
  }

  return [
    {
      key: "name",
      header: "Product",
      minWidth: 220,
      sortValue: (row) => row.name,
    },
    {
      key: "categoryName",
      header: "Category",
      minWidth: 190,
      sortValue: (row) => row.categoryName,
    },
    {
      key: "subCategoryName",
      header: "Sub-category",
      minWidth: 190,
      sortValue: (row) => row.subCategoryName,
    },
    {
      key: "totalItems",
      header: "Items listed",
      align: "right",
      sortValue: (row) => row.totalItems,
      render: (row) => formatNumber(row.totalItems),
    },
    {
      key: "boostedItems",
      header: "Boosted items",
      align: "right",
      sortValue: (row) => row.boostedItems,
      render: (row) => formatNumber(row.boostedItems),
    },
    {
      key: "bookings",
      header: "Bookings",
      align: "right",
      sortValue: (row) => row.bookings,
      render: (row) => formatNumber(row.bookings),
    },
    {
      key: "conversionRate",
      header: "Conversion",
      align: "right",
      sortValue: (row) => row.conversionRate,
      render: (row) => formatPercent(row.conversionRate),
    },
    {
      key: "boostedRate",
      header: "Boosted %",
      align: "right",
      sortValue: (row) => row.boostedRate,
      render: (row) => formatPercent(row.boostedRate),
    },
    {
      key: "avgViews",
      header: "Avg views",
      align: "right",
      sortValue: (row) => row.avgViews,
      render: (row) => formatNumber(row.avgViews),
    },
    {
      key: "leadTimeDays",
      header: "Avg lead time",
      align: "right",
      sortValue: (row) => row.leadTimeDays,
      render: (row) => formatDays(row.leadTimeDays),
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      sortValue: (row) => row.revenue,
      render: (row) => formatMoney(row.revenue),
    },
    {
      key: "avgRating",
      header: "Avg rating",
      align: "right",
      sortValue: (row) => row.avgRating,
      render: (row) => formatRating(row.avgRating),
    },
    {
      key: "reviews",
      header: "Reviews",
      align: "right",
      sortValue: (row) => row.reviews,
      render: (row) => formatNumber(row.reviews),
    },
  ];
}

function getViewSummary(rows) {
  return {
    entityCount: rows.length,
    totalItems: rows.reduce((sum, row) => sum + (row.totalItems || 0), 0),
    totalBookings: rows.reduce((sum, row) => sum + (row.bookings || 0), 0),
    totalRevenue: rows.reduce((sum, row) => sum + (row.revenue || 0), 0),
  };
}

function CategoriesProductsPageContent() {
  const { section = "categories" } = useParams();
  const { resolvedRange } = useDashboardRange();
  const [analytics, setAnalytics] = useState({
    categories: [],
    subCategories: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);

  const currentSection = SECTION_CONFIG[section];
  const columns = useMemo(() => buildColumns(section), [section]);
  const rows = currentSection ? analytics[currentSection.rowsKey] || [] : [];
  const viewSummary = useMemo(() => getViewSummary(rows), [rows]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      try {
        const next = await svc.getCategoriesProductsAnalytics(
          resolvedRange?.start,
          resolvedRange?.end,
        );

        if (!cancelled) {
          setAnalytics(next);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [resolvedRange]);

  if (!currentSection) {
    return <Navigate to="/categories-products/categories" replace />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Categories & Products"
        subtitle="Analyze category, sub-category, and product performance with sortable marketplace tables."
        right={<RangeSelector showCompare={false} />}
      />

      <Card className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {SUBMODULE_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-soft text-brand"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600">
            Showing: {resolvedRange?.label || "Last 7 days"}
          </div>
        </div>
      </Card>

      <MetricsGrid className="mt-4">
        <MetricCard
          title={currentSection.metricLabel}
          value={viewSummary.entityCount}
          icon={FiGrid}
        />
        <MetricCard title="Items listed" value={viewSummary.totalItems} icon={FiBox} />
        <MetricCard
          title="Bookings"
          value={viewSummary.totalBookings}
          icon={FiCalendar}
        />
        <MetricCard
          title="Revenue"
          value={viewSummary.totalRevenue}
          icon={FiDollarSign}
          prefix="$"
        />
      </MetricsGrid>

      <Card className="mt-4 p-0">
        <div className="border-b p-4">
          <p className="text-sm font-semibold text-neutral-900">
            {currentSection.label}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {currentSection.subtitle} Click any column header to sort ascending
            or descending.
          </p>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="rounded-2xl border bg-white px-4 py-8 text-sm text-neutral-500">
              Loading analytics...
            </div>
          ) : (
            <SortableAnalyticsTable
              tableKey={section}
              rows={rows}
              columns={columns}
              emptyText={currentSection.emptyText}
              defaultSort={currentSection.defaultSort}
              mobileCards
              paginated
            />
          )}
        </div>
      </Card>
    </PageContainer>
  );
}

export default function CategoriesProductsPage() {
  return (
    <DashboardRangeProvider>
      <CategoriesProductsPageContent />
    </DashboardRangeProvider>
  );
}
