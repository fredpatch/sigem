import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";
import { PageSplitLayout } from "./page-split-layout";
import { CategoryKPISidebar } from "@/modules/categories/_components/kpi-sidebar";
import { CategoryDTO, FamilyType } from "@/modules/assets/types/asset-type";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";

const CategoriesLayout = () => {
  const { openModal } = useModalStore();
  const { list } = useCategory();
  const { user } = useAuthStore();
  const { data: items } = list;
  const categories: CategoryDTO[] = items?.items || [];

  const role = user?.role;
  const isAdmin = role === "SUPER_ADMIN";

  // Basic counts
  const totalCategories = categories.length;
  const rootCount = categories.filter((c) => !c.parentId).length;
  const subCount = totalCategories - rootCount;

  const familyStats = categories.reduce<
    Record<FamilyType, { total: number; root: number; sub: number }>
  >(
    (acc, cat) => {
      acc[cat.family] ??= { total: 0, root: 0, sub: 0 };
      acc[cat.family].total += 1;
      if (!cat.parentId) acc[cat.family].root += 1;
      else acc[cat.family].sub += 1;
      return acc;
    },
    {
      EQUIPEMENT: { total: 0, root: 0, sub: 0 },
      INFORMATIQUE: { total: 0, root: 0, sub: 0 },
      MOBILIER: { total: 0, root: 0, sub: 0 },
    }
  );

  const prefixStats = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.canonicalPrefix] = (acc[cat.canonicalPrefix] || 0) + 1;
    return acc;
  }, {});

  return (
    <PageSplitLayout
      title="Categories management"
      subtitle="Define and maintain asset categories and families."
      actions={
        isAdmin && (
          <Button
            variant="secondary"
            onClick={() => openModal(ModalTypes.CATEGORY_FORM)}
          >
            <span className="flex items-center gap-1">
              <Plus /> Add Category
            </span>
          </Button>
        )
      }
      sidebarContent={
        <CategoryKPISidebar
          totalCategories={totalCategories}
          rootCount={rootCount}
          subCount={subCount}
          familyStats={familyStats}
          prefixStats={prefixStats}
        />
      }
    >
      <Outlet />
    </PageSplitLayout>
  );
};

export default CategoriesLayout;
