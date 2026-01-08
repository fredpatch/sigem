import { Loader2 } from "lucide-react";
import { useProvidersList } from "../hooks/use-providers";
import { TableComponent } from "@/components/shared/table/table";
import { providerColumns } from "../_components/provider-columns";
import { Guidelines } from "@/common/guidelines";
import { useSearchParams } from "react-router-dom";

export const ProvidersPage = () => {
  const [sp] = useSearchParams();

  const query = {
    active: sp.get("active") === null ? undefined : sp.get("active") === "true",
    withoutContact: sp.get("withoutContact") === "true" ? true : undefined,
    search: sp.get("search") ?? undefined,
    // page/limit si tu veux
  };

  const { data: items, isLoading, isError } = useProvidersList(query);
  const providers = items?.items || [];

  //   console.log(providers);

  return (
    <section className="space-y-4">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mx-auto h-screen">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement des fournisseurs & prestataires...
        </div>
      ) : isError ? (
        <p className="text-red-500 text-sm">
          Fournisseurs service indisponible.
        </p>
      ) : (
        <TableComponent
          emptyState="Aucun fournisseur trouvé"
          filterKeys={["name", "category", "emails"]}
          columns={providerColumns}
          items={providers}
          onBulkAction={(selected: any[]) => console.log(selected)}
        />
      )}

      <div className="pb-4">
        <Guidelines
          variant="info"
          showHelpLink={false}
          compact
          title="Documents et tâches : comment ça fonctionne"
          items={[
            "Un document expiré peut déclencher une tâche de renouvellement.",
            "Les modèles liés à un type de document automatisent le suivi.",
            "Supprimer un document supprime son suivi associé.",
          ]}
        />
      </div>
    </section>
  );
};
