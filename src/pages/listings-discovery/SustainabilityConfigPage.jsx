import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/shared/PageContainer.jsx";
import PageHeader from "../../components/shared/PageHeader.jsx";
import Card from "../../components/shared/Card.jsx";
import Modal from "../../components/shared/Modal.jsx";
import Button from "../../components/shared/Button.jsx";

import SustainabilityConfigForm from "../../components/listingsDiscovery/SustainabilityConfigForm.jsx";
import CarbonCategoryMappingTable from "../../components/listingsDiscovery/CarbonCategoryMappingTable.jsx";

import * as svc from "../../services/listingsDiscovery.service.js";

export default function SustainabilityConfigPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [cfg, cats, maps] = await Promise.all([
        svc.getSustainabilityConfig(),
        svc.listCategories(),
        svc.listCarbonMappings(),
      ]);
      setConfig(cfg);
      setCategories(cats);
      setMappings(maps);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const mappingEnabled = Boolean(config?.mappingEnabled);

  const enrichedMappings = useMemo(() => mappings, [mappings]);

  async function saveConfig(next) {
    await svc.saveSustainabilityConfig(next);
    await load();
  }

  async function upsertMap(payload) {
    await svc.upsertCarbonMapping(payload);
    await load();
  }

  function askDelete(row) {
    setToDelete(row);
    setConfirmDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await svc.removeCarbonMapping(toDelete.id);
    setConfirmDeleteOpen(false);
    setToDelete(null);
    await load();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Sustainability Config"
        subtitle="Carbon database integration + category→CO₂ mapping."
      />

      {loading ? (
        <Card className="p-6">
          <p className="text-sm text-neutral-500">Loading...</p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <SustainabilityConfigForm value={config} onSave={saveConfig} />

          {mappingEnabled ? (
            <CarbonCategoryMappingTable
              categories={categories}
              mappings={enrichedMappings}
              onUpsert={upsertMap}
              onDelete={askDelete}
            />
          ) : (
            <Card className="p-6">
              <p className="text-sm font-semibold text-neutral-900">
                Mapping Disabled
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Enable mapping in Sustainability Config to manage category
                factors.
              </p>
            </Card>
          )}
        </div>
      )}

      <Modal
        open={confirmDeleteOpen}
        title="Delete Mapping"
        onClose={() => setConfirmDeleteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete}>Delete</Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">Delete this mapping?</p>
      </Modal>
    </PageContainer>
  );
}
