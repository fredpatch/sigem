import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { Outlet } from "react-router-dom";

export const PurchasesLayout = () => {
  return (
    <PageSplitLayout
      title="Gestion des achats"
      subtitle="Centralisez et gérez les informations de vos achats."
      sidebarContent={[]}
    >
      <Outlet />
    </PageSplitLayout>
  );
};
