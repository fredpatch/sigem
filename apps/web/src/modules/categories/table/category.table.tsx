import { TableComponent } from "@/components/shared/table/table";
import { CategoryDTO } from "@/modules/assets/types/asset-type";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Loader2 } from "lucide-react";
import { useCategory } from "../hooks/useCategory";
import { columns } from "./columns";

export const CategorySection = () => {
  const { openModal } = useModalStore();
  const { list } = useCategory();
  const { data: assets, error, isLoading } = list;

  const categories: CategoryDTO[] = assets?.items || [];

  return (
    <>
      {/* RIGHT PANEL */}
      <section className="space-y-4">
        {/* TABLE */}
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : error ? (
          <p className="text-red-500 text-sm">Category service unavailable.</p>
        ) : (
          <TableComponent
            emptyState="No category found"
            onSubmit={() => openModal(ModalTypes.CATEGORY_FORM)}
            filterKeys={["identity", "family"]}
            columns={columns}
            items={categories}
            onBulkAction={(selected: any[]) => console.log(selected)}
          />
        )}
      </section>
    </>
  );
};
