import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { SupplySideKPIs } from "@/modules/supplier/_components/SupplySideKPIs";
import { useSuppliesSideKpis } from "@/modules/supplier/hooks/supplies.queries";
import { Outlet } from "react-router-dom";

export const SupplierManagementLayoutPage = () => {
  const { data: sideKpis, isLoading } = useSuppliesSideKpis();

  return (
    <PageSplitLayout
      title="Gestion des fournitures"
      subtitle="Prévisionnel, Articles et Prix fournisseurs - tout sur un seul écran."
      sidebarContent={<SupplySideKPIs data={sideKpis} loading={isLoading} />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};
