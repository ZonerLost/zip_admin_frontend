import React, { useEffect, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import RangeSelector from "../../components/dashboard/RangeSelector.jsx";
import CityOverviewTable from "../../components/cityDevelopmentGrowth/CityOverviewTable.jsx";
import { DashboardRangeProvider } from "../../context/DashboardRangeContext.jsx";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import * as svc from "../../services/cityDevelopmentGrowth.service.js";

function CityDevelopmentGrowthPageContent() {
  const { resolvedRange } = useDashboardRange();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const next = await svc.getCityDevelopmentGrowth(
          resolvedRange?.start,
          resolvedRange?.end,
        );

        if (!cancelled) {
          setRows(Array.isArray(next?.cities) ? next.cities : []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [resolvedRange]);

  return (
    <PageContainer>
      <PageHeader
        title="City Development & Growth"
        subtitle="Simple city overview table for growth and sustainability."
        right={<RangeSelector showCompare={false} />}
      />

      <CityOverviewTable
        rows={rows}
        loading={loading}
        rangeLabel={resolvedRange?.label || "Last 7 days"}
      />
    </PageContainer>
  );
}

export default function CityDevelopmentGrowthPage() {
  return (
    <DashboardRangeProvider>
      <CityDevelopmentGrowthPageContent />
    </DashboardRangeProvider>
  );
}
