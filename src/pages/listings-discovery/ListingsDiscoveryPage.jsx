import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Modal from "../../components/shared/Modal.jsx";
import Button from "../../components/shared/Button.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import RangeSelector from "../../components/dashboard/RangeSelector.jsx";
import ListingsMetrics, {
  ListingsCharts,
} from "../../components/listingsDiscovery/ListingsMetrics.jsx";
import ListingsTable from "../../components/listingsDiscovery/ListingsTable.jsx";
import ListingDetailsDrawer from "../../components/listingsDiscovery/ListingDetailsDrawer.jsx";
import * as svc from "../../services/listingsDiscovery.service.js";
import { DashboardRangeProvider } from "../../context/DashboardRangeContext.jsx";
import { useDashboardRange } from "../../context/useDashboardRange.js";

function normalizeStatus(status) {
  return status === "Pending" ? "Paused" : status;
}

function ListingsDiscoveryPageContent() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();

  const hasLoadedTableRef = useRef(false);
  const hasLoadedAnalyticsRef = useRef(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [analyticsRows, setAnalyticsRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const rangeStart = resolvedRange?.start ?? null;
  const rangeEnd = resolvedRange?.end ?? null;

  const previousRange = useMemo(() => {
    return comparePreviousYear ? resolvePreviousYear?.() : null;
  }, [comparePreviousYear, resolvePreviousYear]);

  const loadCategories = useCallback(async () => {
    const cats = await svc.listCategories();
    setCategories(Array.isArray(cats) ? cats : []);
  }, []);

  const loadListings = useCallback(
    async ({ showPageLoader = false } = {}) => {
      if (showPageLoader) setLoading(true);
      else setTableLoading(true);

      try {
        const list = await svc.listListings({
          q,
          status,
          categoryId,
          page,
          pageSize,
        });

        setRows(Array.isArray(list?.rows) ? list.rows : []);
        setTotal(Number(list?.total || 0));
      } finally {
        if (showPageLoader) setLoading(false);
        setTableLoading(false);
      }
    },
    [q, status, categoryId, page, pageSize],
  );

  const loadAnalytics = useCallback(async () => {
    if (!hasLoadedAnalyticsRef.current) {
      setAnalyticsLoading(true);
    }

    try {
      const list = await svc.listListings({
        start: rangeStart,
        end: rangeEnd,
        page: 1,
        pageSize: 10000,
      });

      setAnalyticsRows(Array.isArray(list?.rows) ? list.rows : []);
      hasLoadedAnalyticsRef.current = true;
    } finally {
      setAnalyticsLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadListings({ showPageLoader: !hasLoadedTableRef.current });
    hasLoadedTableRef.current = true;
  }, [loadListings]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const stats = useMemo(() => {
    const all = analyticsRows;

    const paused = all.filter(
      (item) => normalizeStatus(item.status) === "Paused",
    ).length;

    const active = all.filter(
      (item) => normalizeStatus(item.status) !== "Paused",
    ).length;

    const boosted = all.filter((item) => item.featured).length;

    return {
      total: all.length,
      active,
      boosted,
      paused,
    };
  }, [analyticsRows]);

  const categoryName = useMemo(() => {
    const map = new Map((categories || []).map((c) => [c.id, c.name]));
    return (id) => map.get(id) || "-";
  }, [categories]);

  function view(item) {
    setSelected(item);
    setDrawerOpen(true);
  }

  async function create(payload) {
    await svc.createListing(payload);

    if (page !== 1) {
      setPage(1);
    } else {
      await loadListings();
    }

    await loadAnalytics();
  }

  async function update(item, patch) {
    await svc.updateListing(item.id, patch);
    await Promise.all([loadListings(), loadAnalytics()]);

    setSelected((prev) =>
      prev?.id === item.id ? { ...prev, ...patch } : prev,
    );
  }

  function askDelete(item) {
    setToDelete(item);
    setConfirmDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;

    await svc.removeListing(toDelete.id);
    setConfirmDeleteOpen(false);
    setToDelete(null);

    if (selected?.id === toDelete.id) {
      setDrawerOpen(false);
      setSelected(null);
    }

    await Promise.all([loadListings(), loadAnalytics()]);
  }

  async function toggleFeatured(item) {
    await svc.updateListing(item.id, { featured: !item.featured });
    await Promise.all([loadListings(), loadAnalytics()]);

    setSelected((prev) =>
      prev?.id === item.id ? { ...prev, featured: !item.featured } : prev,
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Listings & Discovery"
        subtitle="Manage listings, categories, discovery behavior, and featured content."
        right={
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Search listings..."
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              />
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-40"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Unlisted">Unlisted</option>
              </select>
              <select
                value={categoryId}
                onChange={(e) => {
                  setPage(1);
                  setCategoryId(e.target.value);
                }}
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-48"
              >
                <option value="all">All Categories</option>
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <RangeSelector wrap />
          </div>
        }
      />

      {analyticsLoading ? (
        <Card className="mt-4 p-6">
          <p className="text-sm text-neutral-500">Loading listing metrics...</p>
        </Card>
      ) : (
        <ListingsMetrics stats={stats} />
      )}

      <div
        key={`${rangeStart ?? "na"}-${rangeEnd ?? "na"}-${
          comparePreviousYear ? "compare" : "single"
        }-${previousRange?.start ?? "na"}-${previousRange?.end ?? "na"}`}
      >
        <ListingsCharts
          start={rangeStart}
          end={rangeEnd}
          comparePrev={comparePreviousYear}
          prevStart={previousRange?.start}
          prevEnd={previousRange?.end}
        />
      </div>

      {loading ? (
        <Card className="mt-4 p-6">
          <p className="text-sm text-neutral-500">Loading listings...</p>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          <ListingsTable
            rows={rows}
            categories={categories}
            loading={tableLoading}
            onView={view}
            onCreate={create}
            onUpdate={update}
            onDelete={askDelete}
            onToggleFeatured={toggleFeatured}
          />

          <div className="rounded-2xl border bg-white p-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      <ListingDetailsDrawer
        open={drawerOpen}
        listing={selected}
        categoryName={selected ? categoryName(selected.categoryId) : "-"}
        onClose={() => setDrawerOpen(false)}
      />

      <Modal
        open={confirmDeleteOpen}
        title="Delete Listing"
        onClose={() => setConfirmDeleteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          Delete <span className="font-semibold">{toDelete?.title}</span>?
        </p>
      </Modal>
    </PageContainer>
  );
}

export default function ListingsDiscoveryPage() {
  return (
    <DashboardRangeProvider>
      <ListingsDiscoveryPageContent />
    </DashboardRangeProvider>
  );
}
