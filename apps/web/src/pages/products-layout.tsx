import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { ProductsSidebar } from "@/modules/providers/_components/products/products-sidebar";
import { Outlet } from "react-router-dom";

export const ProductsLayout = () => {
  return (
    <PageSplitLayout
      className="xl:w-[480px]"
      title="Gestion des produits"
      subtitle="Centralisez et gérez les informations de vos produits."
      sidebarContent={<ProductsSidebar key="products-sidebar" />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};
