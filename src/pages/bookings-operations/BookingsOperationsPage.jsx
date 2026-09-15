import React, { useEffect, useMemo, useRef, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import Modal from "../../components/shared/Modal.jsx";
import Button from "../../components/shared/Button.jsx";

import BookingsMetrics, {
  BookingsCharts,
} from "../../components/bookingsOperations/BookingsMetrics.jsx";
import BookingsTable from "../../components/bookingsOperations/BookingsTable.jsx";
import BookingDetailsDrawer from "../../components/bookingsOperations/BookingDetailsDrawer.jsx";
import ApproveRejectBookingModal from "../../components/bookingsOperations/ApproveRejectBookingModal.jsx";

import * as svc from "../../services/bookingsOperations.service.js";

export default function BookingsOperationsPage() {
  const hasLoadedTableRef = useRef(false);
  const hasLoadedAnalyticsRef = useRef(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const mkISO = (d) => d.toISOString().slice(0, 10);

  const [rangeStart, setRangeStart] = useState(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return mkISO(start);
  });
  const [rangeEnd, setRangeEnd] = useState(() => mkISO(new Date()));
  const [rangePreset, setRangePreset] = useState("last_week");
  const [comparePrevYear, setComparePrevYear] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [analyticsRows, setAnalyticsRows] = useState([]);

  const [tableLoading, setTableLoading] = useState(true);
  const [tableRefreshing, setTableRefreshing] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState(
    "User requested cancellation",
  );
  const [cancelInternalNote, setCancelInternalNote] = useState("");

  const QUICK_CANCEL_REASONS = [
    "User requested cancellation",
    "Payment issue",
    "Item unavailable",
    "Invalid booking details",
  ];

  function applyPreset(preset) {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (preset === "last_week") {
      start.setDate(now.getDate() - 6);
    } else if (preset === "last_month") {
      start.setDate(now.getDate() - 30);
    } else if (preset === "last_12_months") {
      start.setFullYear(now.getFullYear() - 1);
    } else if (preset === "last_year") {
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
    }

    setRangeStart(mkISO(start));
    setRangeEnd(mkISO(end));
  }

  function computePrevRange() {
    try {
      const s = new Date(rangeStart);
      const e = new Date(rangeEnd);
      const ps = new Date(s);
      const pe = new Date(e);
      ps.setFullYear(ps.getFullYear() - 1);
      pe.setFullYear(pe.getFullYear() - 1);

      return {
        prevStart: Date.parse(ps),
        prevEnd: Date.parse(pe),
      };
    } catch {
      return {
        prevStart: null,
        prevEnd: null,
      };
    }
  }

  async function loadTable() {
    const firstLoad = !hasLoadedTableRef.current;

    if (firstLoad) {
      setTableLoading(true);
    } else {
      setTableRefreshing(true);
    }

    try {
      const list = await svc.listBookings({
        q,
        status,
        page,
        pageSize,
      });

      setRows(Array.isArray(list?.rows) ? list.rows : []);
      setTotal(Number(list?.total || 0));
      hasLoadedTableRef.current = true;
    } finally {
      setTableLoading(false);
      setTableRefreshing(false);
    }
  }

  async function loadAnalytics() {
    if (!hasLoadedAnalyticsRef.current) {
      setAnalyticsLoading(true);
    }

    try {
      const list = await svc.listBookings({
        start: Date.parse(rangeStart),
        end: Date.parse(rangeEnd),
        page: 1,
        pageSize: 10000,
      });

      setAnalyticsRows(Array.isArray(list?.rows) ? list.rows : []);
      hasLoadedAnalyticsRef.current = true;
    } finally {
      setAnalyticsLoading(false);
    }
  }

  useEffect(() => {
    loadTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page, pageSize]);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  const stats = useMemo(() => {
    const all = analyticsRows;

    const pending = all.filter((x) => x.status === "Pending").length;
    const approved = all.filter((x) => x.status === "Approved").length;
    const cancelled = all.filter((x) => x.status === "Cancelled").length;
    const amount = all.reduce((sum, x) => sum + Number(x.amount || 0), 0);

    return {
      total: all.length,
      pending,
      approved,
      cancelled,
      amount,
    };
  }, [analyticsRows]);

  function view(booking) {
    setSelected(booking);
    setDrawerOpen(true);
  }

  function openApproveReject(booking) {
    setSelected(booking);
    setApproveModalOpen(true);
  }

  async function approve(booking) {
    await svc.approveBooking(booking.id);
    setApproveModalOpen(false);
    await Promise.all([loadTable(), loadAnalytics()]);
  }

  async function reject(booking, reason) {
    await svc.rejectBooking(booking.id, reason);
    setApproveModalOpen(false);
    await Promise.all([loadTable(), loadAnalytics()]);
  }

  async function issueRefund(booking) {
    if (!booking) return;

    const refundIssuedAt = new Date().toISOString();

    await svc.updateBooking(booking.id, {
      refunded: true,
      refundIssuedAt,
    });

    await Promise.all([loadTable(), loadAnalytics()]);

    setSelected((current) =>
      current && current.id === booking.id
        ? {
            ...current,
            refunded: true,
            refundIssuedAt,
          }
        : current,
    );
  }

  function askCancel(booking, reason) {
    setToCancel({
      booking,
      reason: reason || QUICK_CANCEL_REASONS[0],
    });
    setCancelReason(reason || QUICK_CANCEL_REASONS[0]);
    setCancelInternalNote("");
    setConfirmCancelOpen(true);
  }

  async function confirmCancel() {
    if (!toCancel) return;

    await svc.cancelBooking(
      toCancel.booking.id,
      cancelReason,
      cancelInternalNote,
    );

    setConfirmCancelOpen(false);
    setToCancel(null);
    setCancelInternalNote("");

    await Promise.all([loadTable(), loadAnalytics()]);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Bookings & Operations"
        subtitle="Approve/reject bookings, manage cancellations and delivery rules."
        right={
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Search bookings..."
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgba(71,95,88,0.12)] sm:w-60"
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
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={rangePreset}
                onChange={(e) => {
                  const value = e.target.value;
                  setRangePreset(value);
                  if (value !== "specific") applyPreset(value);
                }}
                className="flex-1 rounded-full border bg-white px-4 py-2 text-sm outline-none sm:flex-none"
              >
                <option value="last_week">Last week</option>
                <option value="last_month">Last month</option>
                <option value="last_12_months">Last 12 months</option>
                <option value="last_year">Last year (Jan - Dec)</option>
                <option value="specific">Specific dates</option>
              </select>

              {rangePreset === "specific" ? (
                <>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => {
                      setRangePreset("specific");
                      setRangeStart(e.target.value);
                    }}
                    className="rounded-full border bg-white px-3 py-2 text-sm outline-none"
                  />
                  <span className="text-sm text-slate-400">—</span>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => {
                      setRangePreset("specific");
                      setRangeEnd(e.target.value);
                    }}
                    className="rounded-full border bg-white px-3 py-2 text-sm outline-none"
                  />
                </>
              ) : null}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={comparePrevYear}
                  onChange={(e) => setComparePrevYear(e.target.checked)}
                />
                <span className="whitespace-nowrap text-sm">
                  Compare prev year
                </span>
              </label>
            </div>
          </div>
        }
      />

      {analyticsLoading ? (
        <Card className="mt-4 p-6">
          <p className="text-sm text-slate-500">Loading booking metrics...</p>
        </Card>
      ) : (
        <BookingsMetrics stats={stats} />
      )}

      {tableLoading ? (
        <Card className="mt-4 min-h-105 p-6">
          <p className="text-sm text-slate-500">Loading bookings...</p>
        </Card>
      ) : (
        <div className="relative mt-4 space-y-3">
          <div
            className={
              tableRefreshing ? "pointer-events-none opacity-60 transition" : ""
            }
          >
            <BookingsTable
              rows={rows}
              onView={view}
              onApproveReject={openApproveReject}
              onCancel={askCancel}
              onRefund={issueRefund}
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

          {tableRefreshing ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-[1px]">
              <div className="rounded-full border bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                Updating bookings...
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div
        key={`${rangeStart}-${rangeEnd}-${comparePrevYear ? "compare" : "single"}`}
      >
        <BookingsCharts
          start={Date.parse(rangeStart)}
          end={Date.parse(rangeEnd)}
          comparePrev={comparePrevYear}
          {...(comparePrevYear ? computePrevRange() : {})}
        />
      </div>

      <BookingDetailsDrawer
        open={drawerOpen}
        booking={selected}
        onClose={() => setDrawerOpen(false)}
        onRefund={issueRefund}
      />

      <ApproveRejectBookingModal
        open={approveModalOpen}
        booking={selected}
        onClose={() => setApproveModalOpen(false)}
        onApprove={approve}
        onReject={reject}
      />

      <Modal
        open={confirmCancelOpen}
        title="Cancel Booking"
        onClose={() => setConfirmCancelOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmCancelOpen(false)}
            >
              Back
            </Button>
            <Button type="button" onClick={confirmCancel}>
              Confirm Cancel
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Cancel{" "}
          <span className="font-semibold">
            {toCancel?.booking?.listingTitle}
          </span>
        </p>

        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Reason</label>
          <select
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          >
            {QUICK_CANCEL_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">
            Internal notes
          </label>
          <textarea
            className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            rows={3}
            value={cancelInternalNote}
            onChange={(e) => setCancelInternalNote(e.target.value)}
            placeholder="Internal note for staff"
          />
        </div>
      </Modal>
    </PageContainer>
  );
}
