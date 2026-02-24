import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { PurchasesSidebar } from "@/modules/providers/_components/purchases/purchase-sidebar";
import { Outlet } from "react-router-dom";

export const PurchasesLayout = () => {
  return (
    <PageSplitLayout
      title="Gestion des achats"
      subtitle="Centralisez et gérez les informations de vos achats."
      sidebarContent={<PurchasesSidebar key={"purchases-sidebar"} />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};
