import { useMemo, useState } from "react";
import { useVehicleTasks } from "../hooks/use-vehicle-tasks";
import { VehicleTaskFilterQuery } from "../types/types";
import { useVehicleTaskTemplates } from "../hooks/use-template-task";
import { computeKpis } from "../helpers/helpers";
import { Loader2 } from "lucide-react";

export const VehicleTasksSidebarContent = () => {
  const [filters, setFilters] = useState<VehicleTaskFilterQuery>({
    page: 1,
    limit: 20,
    status: undefined,
  });

  // 1) KPI sur la liste filtrée (utilisée pour les cartes “Ouvertes / En retard / …”)
  const {
    items: filteredItems,
    isLoading: isLoadingFiltered,
    isError: filteredError,
  } = useVehicleTasks(filters);

  // 2) KPI global (toutes tâches, pour le bloc “Total Tâches”)
  const {
    items: allItems,
    total: allTasks,
    isLoading: isLoadingAll,
    isError: allError,
  } = useVehicleTasks();

  // 3) Templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,

    isError: templatesError,
  } = useVehicleTaskTemplates();

  const filteredKpis = useMemo(
    () => computeKpis(filteredItems),
    [filteredItems]
  );

  const globalKpis = useMemo(() => computeKpis(allItems), [allItems]);

  const templateTypeKpis = useMemo(() => {
    const stats = {
      OIL_CHANGE: 0,
      MAINTENANCE: 0,
      DOCUMENT_RENEWAL: 0,
      OTHER: 0,
    };

    for (const tpl of templates) {
      if (!tpl.active) continue;
      if (stats[tpl.type as keyof typeof stats] !== undefined) {
        stats[tpl.type as keyof typeof stats]++;
      }
    }

    return stats;
  }, [templates]);

  const activeTemplatesCount = useMemo(
    () => templates.filter((t) => t.active).length,
    [templates]
  );

  // const modelsCount = templates.length;

  const isLoadingKpis = isLoadingFiltered || isLoadingAll || isLoadingTemplates;
  const hasError = filteredError || allError;
  const templateError = templatesError;

  const handleStatusFilter = (
    status: "OPEN" | "OVERDUE" | "DUE_SOON" | "COMPLETED" | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Bloc résumé global */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">Totale Tâches</p>

        <p className="mt-1 text-3xl font-semibold">
          {isLoadingAll ? <Loader2 className="animate-spin" /> : allTasks}
        </p>

        {hasError ? (
          <p className="mt-1 text-xs text-red-600">
            Impossible de charger les indicateurs.
          </p>
        ) : (
          <span className="mt-1 flex items-center gap-2">
            <p className="text-xs text-yellow-700">
              {isLoadingKpis ? (
                <Loader2 className="animate-spin" />
              ) : (
                `${globalKpis.open} tâches ouvertes`
              )}
            </p>
            <p className="text-xs text-green-600">
              {isLoadingKpis ? (
                <Loader2 className="animate-spin" />
              ) : (
                `${globalKpis.completed} tâches terminées`
              )}
            </p>
          </span>
        )}

        {templateError && (
          <p className="mt-1 text-xs text-red-600">
            Impossible de charger les Modèles.
          </p>
        )}
      </div>

      {/* Cartes KPI filtrées */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Ouvertes"
          value={filteredKpis.open}
          loading={isLoadingFiltered}
        />
        <KpiCard
          label="En retard"
          value={filteredKpis.overdue}
          variant="destructive"
          loading={isLoadingFiltered}
        />
        <KpiCard
          label="À venir"
          value={filteredKpis.dueSoon}
          loading={isLoadingFiltered}
        />
        <KpiCard
          label="Terminées"
          value={filteredKpis.completed}
          loading={isLoadingFiltered}
        />
        <KpiCard
          className="col-span-2"
          label="Modèles actifs"
          value={activeTemplatesCount}
          loading={isLoadingTemplates}
          subtitle={
            isLoadingTemplates
              ? "Chargement des modèles…"
              : [
                  templateTypeKpis.OIL_CHANGE
                    ? `Vidange · ${templateTypeKpis.OIL_CHANGE}`
                    : null,
                  templateTypeKpis.MAINTENANCE
                    ? `Maint. · ${templateTypeKpis.MAINTENANCE}`
                    : null,
                  templateTypeKpis.DOCUMENT_RENEWAL
                    ? `Docs · ${templateTypeKpis.DOCUMENT_RENEWAL}`
                    : null,
                  templateTypeKpis.OTHER
                    ? `Autres · ${templateTypeKpis.OTHER}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" • ") || "Aucun modèle configuré"
          }
        />
      </div>

      {/* Filtres */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Filtrer par statut
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusChip
            label="Toutes"
            active={!filters.status}
            onClick={() => handleStatusFilter(undefined)}
          />
          <StatusChip
            label="Ouvertes"
            active={filters.status === "OPEN"}
            onClick={() => handleStatusFilter("OPEN")}
          />
          <StatusChip
            label="En retard"
            active={filters.status === "OVERDUE"}
            onClick={() => handleStatusFilter("OVERDUE")}
          />
          <StatusChip
            label="À venir"
            active={filters.status === "DUE_SOON"}
            onClick={() => handleStatusFilter("DUE_SOON")}
          />
          <StatusChip
            label="Terminées"
            active={filters.status === "COMPLETED"}
            onClick={() => handleStatusFilter("COMPLETED")}
          />
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({
  label,
  value,
  variant,
  className,
  loading,
  subtitle,
}: {
  label: string;
  className?: string;
  value: number;
  loading?: boolean;
  variant?: "default" | "destructive";
  subtitle?: string;
}) => (
  <div
    className={`rounded-lg border bg-card px-3 py-2 ${className ?? ""} ${
      variant === "destructive" ? "border-destructive/40" : ""
    } ${loading ? "opacity-60 animate-pulse" : ""}`}
  >
    <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-bold tabular-nums">
      {loading ? <Loader2 className="animate-spin" /> : value}
    </p>

    {subtitle && (
      <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
        {subtitle}
      </p>
    )}
  </div>
);

const StatusChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs border transition ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    }`}
  >
    {label}
  </button>
);
