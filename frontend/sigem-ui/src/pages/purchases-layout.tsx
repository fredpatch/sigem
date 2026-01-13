import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
<<<<<<< HEAD
=======
import { PurchasesSidebar } from "@/modules/providers/_components/purchases/purchase-sidebar";
>>>>>>> a6056fc97e8e878a7d42a358acd11c2322d17f8a
import { Outlet } from "react-router-dom";

export const PurchasesLayout = () => {
  return (
    <PageSplitLayout
      title="Gestion des achats"
      subtitle="Centralisez et gérez les informations de vos achats."
<<<<<<< HEAD
      sidebarContent={[]}
=======
      sidebarContent={<PurchasesSidebar key={"purchases-sidebar"} />}
>>>>>>> a6056fc97e8e878a7d42a358acd11c2322d17f8a
    >
      <Outlet />
    </PageSplitLayout>
  );
};
