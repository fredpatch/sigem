import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { Button } from "@/components/ui/button";
import { ProviderKpiSidebar } from "@/modules/providers/_components/provider-kpi-sidebar";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Plus } from "lucide-react";
import { Outlet, useSearchParams } from "react-router-dom";

export const ProvidersLayout = () => {
  const { openModal } = useModalStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const setFilterParams = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams);

    // reset known keys first (simple + avoids stale)
    ["isActive", "withoutContact"].forEach((k) => sp.delete(k));

    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined) sp.set(k, v);
    });

    setSearchParams(sp, { replace: true });
  };

  const activeFilter =
    searchParams.get("withoutContact") === "true"
      ? "withoutContact"
      : searchParams.get("active") === "false"
        ? "inactive"
        : "all";

  return (
    <PageSplitLayout
      actions={
        <Button
          variant={"secondary"}
          onClick={() => openModal(ModalTypes.PROVIDERS_FORM)}
        >
          <span className="flex gap-2 items-center">
            <Plus />
            Ajouter un fournisseur
          </span>
        </Button>
      }
      title="Gestion des fournisseurs et prestataires"
      subtitle="Centralisez et gérez les informations de vos fournisseurs et prestataires de services."
      sidebarContent={
        <ProviderKpiSidebar
          activeFilter={activeFilter}
          onShowAll={() => setFilterParams({ active: "true" })}
          onShowWithoutContact={() =>
            setFilterParams({ withoutContact: "true" })
          }
          onShowInactive={() => setFilterParams({ active: "false" })}
        />
      }
    >
      <Outlet />
    </PageSplitLayout>
  );
};
