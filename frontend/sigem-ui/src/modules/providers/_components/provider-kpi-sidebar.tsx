import { Users, UserCheck, UserX, Ban } from "lucide-react";
import { useProviderStats } from "../hooks/use-providers";
import { KpiCard } from "./kpi-card";

// Optionnel: si tu veux que cliquer un KPI applique un filtre,
// tu passeras des callbacks (onFilterChange)
type Props = {
  activeFilter?: "all" | "withoutContact" | "inactive";
  onShowAll?: () => void;
  onShowWithoutContact?: () => void;
  onShowInactive?: () => void;
};

export function ProviderKpiSidebar({
  activeFilter,
  onShowAll,
  onShowWithoutContact,
  onShowInactive,
}: Props) {
  const { data, isLoading, error } = useProviderStats();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 rounded-xl border bg-card animate-pulse" />
        <div className="h-24 rounded-xl border bg-card animate-pulse" />
        <div className="h-24 rounded-xl border bg-card animate-pulse" />
        <div className="h-24 rounded-xl border bg-card animate-pulse" />
      </div>
    );
  }

  console.log("ProviderKpiSidebar data:", data, "error:", error);

  if (error || !data) {
    return (
      <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        Impossible de charger les KPI.
      </div>
    );
  }

  const total = data.total;
  const suppliers = data.byType.FOURNISSEUR;
  const providers = data.byType.PRESTATAIRE;

  return (
    <div className="space-y-3">
      <KpiCard
        icon={UserCheck}
        label="Contacts complets"
        value={`${data.contactRate}%`}
        subLabel={`${data.withContact} / ${total} ont au moins un téléphone ou un email`}
        tone={data.contactRate < 80 ? "warning" : "success"}
      />
      <KpiCard
        icon={Users}
        label="Total entités"
        value={total}
        active={activeFilter === "all"}
        subLabel={`Fournisseurs: ${suppliers} · Prestataires: ${providers}`}
        onClick={onShowAll}
      />

      <KpiCard
        icon={UserX}
        label="Sans contact"
        value={data.withoutContact}
        subLabel="Aucun téléphone + aucun email"
        active={activeFilter === "withoutContact"}
        tone={data.withoutContact > 0 ? "warning" : "neutral"}
        onClick={onShowWithoutContact}
      />

      <KpiCard
        icon={Ban}
        label="Inactifs"
        value={data.inactive}
        active={activeFilter === "inactive"}
        subLabel="Fournisseurs/prestataires désactivés"
        tone={data.inactive > 0 ? "warning" : "neutral"}
        onClick={onShowInactive}
      />
    </div>
  );
}
