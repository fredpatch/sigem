import { Guidelines } from "@/common/guidelines";
import { TableComponent } from "@/components/shared/table/table";
import { columns } from "@/modules/assets/_components/table/columns";
import { useAsset } from "@/modules/assets/hooks/useAsset";
import { AssetDTO } from "@/modules/assets/types/asset-type";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Loader2, Plus } from "lucide-react";

export const AssetMain = () => {
  const { openModal } = useModalStore();
  const { user } = useAuthStore();
  const role = user?.role || "";

  const isAdmin =
    role === "SUPER_ADMIN" || role === "ADMIN" || role === "MG_COS";

  const { list } = useAsset(undefined, isAdmin ? true : false);
  const { data: assets, error, isLoading } = list;

  const items: AssetDTO[] = assets?.items || [];

  return (
    <>
      {/* RIGHT PANEL */}
      <section className="space-y-4">
        {/* TABLE */}
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : error ? (
          <p className="text-red-500 text-sm">Asset service unavailable.</p>
        ) : (
          <TableComponent
            emptyState="No assets found"
            btnActionIcon={<Plus className="w-4 h-4" />}
            onSubmit={() => openModal(ModalTypes.ASSETS_FORM)}
            filterKeys={["label", "situation", "locationId.code"]}
            columns={columns}
            items={items}
            // onBulkAction={(selected: any[]) => console.log(selected)}
          />
        )}

        <div className="pb-4">
          <Guidelines
            helpRef={{ section: "patrimoine", topic: "assets" }}
            variant="info"
            title="Comment gérer les biens du patrimoine ?"
            description="Retrouvez, filtrez et mettez à jour les biens matériels de l’organisation."
            items={[
              "Ajoutez un bien via “Ajouter un bien” (catégorie, emplacement et statut).",
              "Utilisez la recherche et les filtres pour retrouver rapidement un bien.",
              "Le code est généré automatiquement selon la catégorie (pour garantir l’unicité).",
              "Vous pouvez modifier ou désactiver un bien depuis la colonne “Actions”.",
            ]}
          />
        </div>
      </section>
    </>
  );
};
