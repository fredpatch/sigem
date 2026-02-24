import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { Outlet } from "react-router-dom";

export const PurchaseRequestsLayout = () => {
  return (
    <PageSplitLayout
      title="Gestion des demandes d'achat"
      subtitle="Centralisez et gérez les informations de vos demandes d'achat."
      sidebarContent={[]}
    >
      <Outlet />
    </PageSplitLayout>
  );
};
