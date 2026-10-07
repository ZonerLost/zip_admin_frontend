import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
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

function buildProductColumns() {
  return [
    {
      key: "name",
      header: "Product",
      minWidth: 200,
      sortValue: (row) => row.name,
    },
    {
      key: "categoryName",
      header: "Category",
      minWidth: 160,
      sortValue: (row) => row.categoryName,
    },
    {
      key: "subCategoryName",
      header: "Sub-category",
      minWidth: 160,
      sortValue: (row) => row.subCategoryName,
    },
    {
      key: "totalItems",
      header: "Items listed",
      minWidth: 110,
      align: "right",
      sortValue: (row) => row.totalItems,
      render: (row) => formatNumber(row.totalItems),
    },
    {
      key: "boostedItems",
      header: "Boosted items",
      minWidth: 120,
      align: "right",
      sortValue: (row) => row.boostedItems,
      render: (row) => formatNumber(row.boostedItems),
    },
    {
      key: "bookings",
      header: "Bookings",
      minWidth: 100,
      align: "right",
      sortValue: (row) => row.bookings,
      render: (row) => formatNumber(row.bookings),
    },
    {
      key: "conversionRate",
      header: "Conversion",
      minWidth: 110,
      align: "right",
      sortValue: (row) => row.conversionRate,
      render: (row) => formatPercent(row.conversionRate),
    },
    {
      key: "boostedRate",
      header: "Boosted %",
      minWidth: 110,
      align: "right",
      sortValue: (row) => row.boostedRate,
      render: (row) => formatPercent(row.boostedRate),
    },
    {
      key: "avgViews",
      header: "Avg views",
      minWidth: 110,
      align: "right",
      sortValue: (row) => row.avgViews,
      render: (row) => formatNumber(row.avgViews),
    },
    {
      key: "leadTimeDays",
      header: "Avg lead time",
      minWidth: 120,
      align: "right",
      sortValue: (row) => row.leadTimeDays,
      render: (row) => formatDays(row.leadTimeDays),
    },
    {
      key: "revenue",
      header: "Revenue",
      minWidth: 110,
      align: "right",
      sortValue: (row) => row.revenue,
      render: (row) => formatMoney(row.revenue),
    },
    {
      key: "avgRating",
      header: "Avg rating",
      minWidth: 110,
      align: "right",
      sortValue: (row) => row.avgRating,
      render: (row) => formatRating(row.avgRating),
    },
    {
      key: "reviews",
      header: "Reviews",
      minWidth: 100,
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

function ProductsPageContent() {
  const { section } = useParams();
  const { resolvedRange } = useDashboardRange();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(() => buildProductColumns(), []);
  const viewSummary = useMemo(() => getViewSummary(products), [products]);

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
          setProducts(Array.isArray(next?.products) ? next.products : []);
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

  if (section && section !== "overall-products") {
    return <Navigate to="/categories-products/overall-products" replace />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        subtitle="Analyze product-type performance across listings, views, bookings, and reviews."
        right={<RangeSelector showCompare={false} />}
      />

      <Card className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-neutral-800">
            Marketplace Products
          </p>
          <div className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600">
            Showing: {resolvedRange?.label || "Last 7 days"}
          </div>
        </div>
      </Card>

      <MetricsGrid className="mt-4">
        <MetricCard
          title="Tracked products"
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
            Product Analytics
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Product-type performance across listings, views, bookings, and reviews. Click any column header to sort ascending or descending.
          </p>
        </div>

        <div className="p-2 sm:p-4">
          {loading ? (
            <div className="rounded-2xl border bg-white px-4 py-8 text-sm text-neutral-500">
              Loading analytics...
            </div>
          ) : (
            <SortableAnalyticsTable
              tableKey="products"
              rows={products}
              columns={columns}
              emptyText="No product analytics available for this range."
              defaultSort={{ key: "revenue", direction: "desc" }}
              scrollable
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
      <ProductsPageContent />
    </DashboardRangeProvider>
  );
}
