import { Guidelines } from "@/common/guidelines";
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

      <div className="flex flex-col gap-2">
        <Guidelines
          variant="info"
          title="Comment fonctionne la gestion des stocks ?"
          description="Ce module suit les entrées/sorties par article, et vous aide à repérer les risques de rupture."
          items={[
            {
              title: "Indicateurs (sidebar)",
              text: "• Articles = nombre d’articles suivis • Qté totale = somme des quantités disponibles • Sous seuil = articles dont Disponible ≤ Seuil minimum • Flux & résumé = IN/OUT/Ajustements sur la période, et Net = somme des deltas (IN − OUT ± Ajustements).",
            },
            {
              title: "Actions rapides",
              text: "• Entrée (IN) : réception / livraison • Sortie (OUT) : consommation / distribution • Ajuster : inventaire (corriger une quantité réelle).",
            },
            {
              title: "Workflow recommandé",
              text: "1) Plan prévisionnel validé → (option) génération automatique des entrées à la réception. 2) Sorties au fil des consommations. 3) Ajustement lors d’un inventaire pour corriger l’écart.",
            },
            {
              title: "Seuil minimum",
              text: "Le seuil sert d’alerte : si Disponible ≤ Seuil, l’article est signalé “Sous seuil”. Vous pouvez ajuster le seuil par article via “Ajuster seuil”.",
            },
          ]}
          helpRef={{ section: "mg", topic: "stocks" }}
          helpLabel="Voir le guide complet"
        />

        <Guidelines
          variant="tips"
          title="Actions rapides (quoi utiliser ?)"
          items={[
            {
              title: "Entrée",
              text: "À utiliser lors d’une réception (approvisionnement, livraison fournisseur). Peut enregistrer fournisseur + prix unitaire.",
            },
            {
              title: "Sortie",
              text: "À utiliser lors d’une consommation interne (atelier, service, distribution). Le système vérifie le stock disponible.",
            },
            {
              title: "Ajustement inventaire",
              text: "À utiliser après comptage réel : tu donnes la quantité comptée, le système calcule automatiquement le delta.",
            },
            {
              title: "Ajuster seuil",
              text: "Fixe le niveau minimum attendu pour déclencher l’alerte 'Sous seuil' sur le tableau et les KPIs.",
            },
          ]}
        />

        <Guidelines
          variant="warning"
          title="Workflow recommandé (MGX)"
          description="Suivez ce flux pour garder un stock fiable et traçable."
          items={[
            {
              title: "1) Réception",
              text: "Créer une Entrée (IN) avec fournisseur si possible. Le prix unitaire sert aux estimations de valeur stock.",
            },
            {
              title: "2) Consommation",
              text: "Créer une Sortie (OUT) avec un motif (service, projet, urgence). Le système bloque si stock insuffisant.",
            },
            {
              title: "3) Inventaire",
              text: "Faire un Ajustement (ADJUST) après comptage réel. C’est la seule action qui corrige l’écart réel.",
            },
            {
              title: "4) Seuil minimum",
              text: "Mettre à jour le seuil quand l’article devient critique. 'Sous seuil' = alerte, pas forcément blocage.",
            },
          ]}
        />
      </div>
    </PageSplitLayout>
  );
};
