import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { Button } from "@/components/ui/button";
import { AssetKPISidebar } from "@/modules/assets/_components/kpi-sidebar";
import { useAsset } from "@/modules/assets/hooks/useAsset";
import { AssetDTO } from "@/modules/assets/types/asset-type";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";

const AssetLayout = () => {
  const { openModal } = useModalStore();
  const { list } = useAsset();
  const { data: assets } = list;

  const items: AssetDTO[] = assets?.items || [];

  // 1) Total
  const total = items.length;

  // 2) By situation
  const statsBySituation = {
    NEUF: items.filter((a) => a.situation === "NEUF").length,
    EN_SERVICE: items.filter((a) => a.situation === "EN_SERVICE").length,
    EN_PANNE: items.filter((a) => a.situation === "EN_PANNE").length,
    HORS_SERVICE: items.filter((a) => a.situation === "HORS_SERVICE").length,
    REFORME: items.filter((a) => a.situation === "REFORME").length,
  };

  // 3) By category
  const statsByCategory = items.reduce<Record<string, number>>((acc, a) => {
    const key = a.category?.label ?? a.categoryId?.label ?? "Non catégorisé";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 4) By family (INFORMATIQUE / EQUIPEMENT / MOBILIER)
  const statsByFamily = items.reduce<Record<string, number>>((acc, a) => {
    const key = a.category?.family ?? a.categoryId?.family ?? "N/A";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 5) By code prefix (ex: IAC, MCH, EQF…)
  const statsByPrefix = items.reduce<Record<string, number>>((acc, a) => {
    const key = a.prefix ?? "N/A";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <PageSplitLayout
      actions={
        <Button
          variant={"secondary"}
          onClick={() => openModal(ModalTypes.ASSETS_FORM)}
        >
          <span className="flex gap-2 items-center">
            <Plus />
            Ajouter un bien
          </span>
        </Button>
      }
      title="Gestion du patrimoine"
      subtitle="Suivi et gestion des actifs de l'entreprise."
      sidebarContent={
        <AssetKPISidebar
          total={total}
          statsBySituation={statsBySituation}
          statsByFamily={statsByFamily}
          statsByCategory={statsByCategory}
          statsByPrefix={statsByPrefix}
        />
      }
    >
      <Outlet />
    </PageSplitLayout>
  );
};

export default AssetLayout;
