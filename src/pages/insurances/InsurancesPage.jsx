import React, { useCallback, useEffect, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import RangeSelector from "../../components/dashboard/RangeSelector.jsx";
import InsuranceMetrics from "../../components/insurances/InsuranceMetrics.jsx";
import InsurancePlansTable from "../../components/insurances/InsurancePlansTable.jsx";
import InsuranceOverridesTable from "../../components/insurances/InsuranceOverridesTable.jsx";
import InsuranceUsageTables from "../../components/insurances/InsuranceUsageTables.jsx";
import { DashboardRangeProvider } from "../../context/DashboardRangeContext.jsx";
import { useDashboardRange } from "../../context/useDashboardRange.js";
import * as svc from "../../services/insurances.service.js";

function InsurancesPageContent() {
  const { resolvedRange } = useDashboardRange();

  const [plans, setPlans] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [options, setOptions] = useState({
    categories: [],
    subCategories: [],
    items: [],
  });
  const [dashboard, setDashboard] = useState({
    metrics: null,
    categoryUsage: [],
    subCategoryUsage: [],
    productUsage: [],
    planUsage: [],
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextPlans, nextOverrides, nextOptions, nextDashboard] =
        await Promise.all([
          svc.listInsurancePlans(),
          svc.listInsuranceOverrides(),
          svc.getInsuranceAssignmentOptions(),
          svc.getInsuranceDashboard(resolvedRange?.start, resolvedRange?.end),
        ]);

      setPlans(nextPlans);
      setOverrides(nextOverrides);
      setOptions(nextOptions);
      setDashboard(nextDashboard);
    } finally {
      setLoading(false);
    }
  }, [resolvedRange]);

  useEffect(() => {
    load();
  }, [load]);

  async function safely(action) {
    try {
      await action();
      await load();
    } catch (error) {
      window.alert(error?.message || "Something went wrong.");
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Insurances"
        subtitle="Manage insurance plans, inheritance rules, item overrides, and insurance adoption analytics."
        right={<RangeSelector showCompare={false} />}
      />

      <InsuranceMetrics metrics={dashboard.metrics} />

      <div className="mt-4 space-y-3">
        <InsurancePlansTable
          plans={plans}
          options={options}
          overrideRows={overrides}
          onCreate={(payload) => safely(() => svc.createInsurancePlan(payload))}
          onUpdate={(plan, payload) =>
            safely(() => svc.updateInsurancePlan(plan.id, payload))
          }
          onDelete={(plan) => safely(() => svc.removeInsurancePlan(plan.id))}
        />

        <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <InsuranceOverridesTable
            rows={overrides}
            items={options.items}
            plans={plans}
            onCreate={(payload) =>
              safely(() => svc.createInsuranceOverride(payload))
            }
            onUpdate={(override, payload) =>
              safely(() => svc.updateInsuranceOverride(override.id, payload))
            }
            onDelete={(override) =>
              safely(() => svc.removeInsuranceOverride(override.id))
            }
          />

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">
              Inheritance Logic
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Insurance plans can be assigned in bulk at category and
              sub-category level.
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Specific item overrides replace inherited plans for the selected
              item only.
            </p>
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Example: Category <span className="font-medium">Camping</span>{" "}
              inherits Basic Protection + Premium Cover, but item{" "}
              <span className="font-medium">High-value tent</span> can override
              that inheritance and keep only Basic Protection.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              The date filter applies to insurance metrics and usage tables
              below. Plan setup and overrides are configuration-level controls.
            </p>
          </Card>
        </div>

        {loading ? (
          <Card className="p-6">
            <p className="text-sm text-slate-500">Loading insurance data...</p>
          </Card>
        ) : (
          <InsuranceUsageTables
            categoryUsage={dashboard.categoryUsage}
            subCategoryUsage={dashboard.subCategoryUsage}
            productUsage={dashboard.productUsage}
            planUsage={dashboard.planUsage}
          />
        )}
      </div>
    </PageContainer>
  );
}

export default function InsurancesPage() {
  return (
    <DashboardRangeProvider>
      <InsurancesPageContent />
    </DashboardRangeProvider>
  );
}
