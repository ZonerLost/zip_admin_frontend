import React, { useEffect, useMemo, useRef, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import RangeSelector from "../../components/dashboard/RangeSelector.jsx";
import { DashboardRangeProvider } from "../../context/DashboardRangeContext.jsx";
import { useDashboardRange } from "../../context/useDashboardRange.js";

import FinanceMetrics from "../../components/paymentsFinance/FinanceMetrics.jsx";
import TransactionsTable from "../../components/paymentsFinance/TransactionsTable.jsx";
import RefundModal from "../../components/paymentsFinance/RefundModal.jsx";
import FeeSettingsForm from "../../components/paymentsFinance/FeeSettingsForm.jsx";
import RevenueTotal from "../../components/paymentsFinance/RevenueTotal.jsx";
import RevenueBoosted from "../../components/paymentsFinance/RevenueBoosted.jsx";
import RevenueInsurance from "../../components/paymentsFinance/RevenueInsurance.jsx";
import RevenueFees from "../../components/paymentsFinance/RevenueFees.jsx";
import RefundsChart from "../../components/paymentsFinance/RefundsChart.jsx";

import * as svc from "../../services/paymentsFinance.service.js";

function PaymentsFinancePageContent() {
  const { resolvedRange, comparePreviousYear, resolvePreviousYear } =
    useDashboardRange();

  const hasLoadedTableRef = useRef(false);
  const hasLoadedAnalyticsRef = useRef(false);

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [statsRows, setStatsRows] = useState([]);

  const [fees, setFees] = useState(null);

  const [tableLoading, setTableLoading] = useState(true);
  const [tableRefreshing, setTableRefreshing] = useState(false);

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [feesLoading, setFeesLoading] = useState(true);

  const [refundOpen, setRefundOpen] = useState(false);
  // Refunding is a per-row action now, so the modal needs to know which payment it is confirming.
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundBusyId, setRefundBusyId] = useState("");

  const rangeStart = resolvedRange?.start ?? null;
  const rangeEnd = resolvedRange?.end ?? null;

  const previousRange = useMemo(() => {
    return comparePreviousYear ? resolvePreviousYear?.() : null;
  }, [comparePreviousYear, resolvePreviousYear]);

  const analyticsRenderKey = `${rangeStart ?? "na"}-${rangeEnd ?? "na"}-${
    comparePreviousYear ? "compare" : "single"
  }-${previousRange?.start ?? "na"}-${previousRange?.end ?? "na"}`;

  async function loadTable() {
    const firstLoad = !hasLoadedTableRef.current;

    if (firstLoad) {
      setTableLoading(true);
    } else {
      setTableRefreshing(true);
    }

    try {
      const list = await svc.listTransactions({
        q,
        type,
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
    const firstLoad = !hasLoadedAnalyticsRef.current;

    if (firstLoad) {
      setAnalyticsLoading(true);
    }

    try {
      const statsList = await svc.listTransactions({
        start: rangeStart,
        end: rangeEnd,
        page: 1,
        pageSize: 10000,
      });

      setStatsRows(Array.isArray(statsList?.rows) ? statsList.rows : []);
      hasLoadedAnalyticsRef.current = true;
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function loadFees() {
    setFeesLoading(true);
    try {
      const fee = await svc.getFeeSettings();
      setFees(fee);
    } finally {
      setFeesLoading(false);
    }
  }

  useEffect(() => {
    loadTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, status, page, pageSize]);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    loadFees();
  }, []);

  const stats = useMemo(() => {
    const all = statsRows;

    const feesSum = all
      .filter((x) => x.type === "Fee")
      .reduce((sum, x) => sum + Number(x.amount || 0), 0);

    const payoutsSum = all
      .filter((x) => x.type === "Payout")
      .reduce((sum, x) => sum + Number(x.amount || 0), 0);

    const refundsSum = all
      .filter((x) => x.type === "Refund")
      .reduce((sum, x) => sum + Number(x.amount || 0), 0);

    const pending = all.filter((x) => x.status === "Pending").length;

    return {
      total: all.length,
      fees: feesSum,
      payouts: payoutsSum,
      refunds: refundsSum,
      pending,
    };
  }, [statsRows]);

  function askRefund(payment) {
    setRefundTarget(payment);
    setRefundOpen(true);
  }

  async function createRefund(payload) {
    setRefundBusyId(payload.paymentId);
    try {
      // Errors propagate to the modal, which keeps itself open and shows them — a refund that
      // failed quietly would leave an admin believing the renter had their money back.
      await svc.createRefund(payload);
      await Promise.all([loadTable(), loadAnalytics()]);
    } finally {
      setRefundBusyId("");
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Payments & Finance"
        subtitle="Transactions, refunds and platform fee configuration."
        right={
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Search transactions..."
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/12"
              />

              <select
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value);
                }}
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-40"
              >
                <option value="all">All Types</option>
                <option value="Charge">Charge</option>
                <option value="Fee">Fee</option>
                <option value="Payout">Payout</option>
                <option value="Refund">Refund</option>
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none sm:w-40"
              >
                <option value="all">All Status</option>
                <option value="Succeeded">Succeeded</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <RangeSelector wrap />
          </div>
        }
      />

      <div key={`metrics-${rangeStart ?? "na"}-${rangeEnd ?? "na"}`}>
        <FinanceMetrics stats={stats} />
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3" key={analyticsRenderKey}>
          {analyticsLoading ? (
            <Card className="p-6">
              <p className="text-sm text-neutral-500">Loading analytics...</p>
            </Card>
          ) : (
            <>
              <RevenueTotal
                start={rangeStart}
                end={rangeEnd}
                comparePrev={comparePreviousYear}
                prevStart={previousRange?.start}
                prevEnd={previousRange?.end}
              />
              <RevenueBoosted
                start={rangeStart}
                end={rangeEnd}
                comparePrev={comparePreviousYear}
                prevStart={previousRange?.start}
                prevEnd={previousRange?.end}
              />
              <RevenueInsurance
                start={rangeStart}
                end={rangeEnd}
                comparePrev={comparePreviousYear}
                prevStart={previousRange?.start}
                prevEnd={previousRange?.end}
              />
              <RevenueFees
                start={rangeStart}
                end={rangeEnd}
                comparePrev={comparePreviousYear}
                prevStart={previousRange?.start}
                prevEnd={previousRange?.end}
              />
              <RefundsChart
                start={rangeStart}
                end={rangeEnd}
                comparePrev={comparePreviousYear}
                prevStart={previousRange?.start}
                prevEnd={previousRange?.end}
              />
            </>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="relative">
              {tableLoading ? (
                <Card className="p-6">
                  <p className="text-sm text-neutral-500">
                    Loading transactions...
                  </p>
                </Card>
              ) : (
                <div
                  className={
                    tableRefreshing
                      ? "pointer-events-none opacity-60 transition"
                      : ""
                  }
                >
                  <TransactionsTable
                    rows={rows}
                    onRefund={askRefund}
                    busyId={refundBusyId}
                  />
                </div>
              )}

              {tableRefreshing ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-[1px]">
                  <div className="rounded-full border bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm">
                    Updating transactions...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onChange={setPage}
              />
            </div>
          </div>

          <div className="space-y-3">
            {feesLoading ? (
              <Card className="p-6">
                <p className="text-sm text-neutral-500">
                  Loading fee settings...
                </p>
              </Card>
            ) : fees ? (
              <FeeSettingsForm value={fees} />
            ) : null}
          </div>
        </div>

      </div>

      <RefundModal
        open={refundOpen}
        payment={refundTarget}
        onClose={() => {
          setRefundOpen(false);
          setRefundTarget(null);
        }}
        onSubmit={createRefund}
      />
    </PageContainer>
  );
}

export default function PaymentsFinancePage() {
  return (
    <DashboardRangeProvider>
      <PaymentsFinancePageContent />
    </DashboardRangeProvider>
  );
}
