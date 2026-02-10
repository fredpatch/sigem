import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { StockSidebar } from "@/modules/stocks/_components/stock-sidebar";
import { Outlet } from "react-router-dom";

export const StocksManagementLayoutPage = () => {
  return (
    <PageSplitLayout
      title="Gestion des stocks"
      subtitle="Suivi et gestion des stocks"
      sidebarContent={<StockSidebar />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};
