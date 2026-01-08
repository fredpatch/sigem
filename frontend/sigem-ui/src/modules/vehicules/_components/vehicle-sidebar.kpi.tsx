// src/modules/vehicules/_components/vehicles-sidebar-content.tsx
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useVehicles } from "../hooks/use-vehicle";
import { useVehicleDocumentsMonitoring } from "../hooks/use-vehicle-documents";
import {
  VehicleDocument,
  VehicleDocumentType,
} from "../types/vehicle-document.types";
import { computeDocumentKpis, getDocTypeLabel } from "../helpers/helpers";

type VehicleStatus = "ACTIVE" | "IN_MAINTENANCE" | "INACTIVE" | "RETIRED";

type Vehicle = {
  id: string;
  status: VehicleStatus;
  currentMileage?: number | null;
  assignedToName?: string | null;
};

type VehiclesListResponse = {
  items: Vehicle[];
  total: number;
  page: number;
  limit: number;
};

const VehiclesSidebarContent = () => {
  const { list } = useVehicles(undefined, { page: 1, limit: 100 });

  const { data, isLoading, isError } = list as {
    data?: VehiclesListResponse;
    isLoading: boolean;
    isError: boolean;
  };

  const vehicles: Vehicle[] = data?.items ?? [];
  const total = data?.total ?? vehicles.length;

  const {
    active,
    inMaintenance,
    inactive,
    retired,
    assigned,
    unassigned,
    // avgMileage,
  } = useMemo(() => {
    let active = 0;
    let inMaintenance = 0;
    let inactive = 0;
    let retired = 0;
    let assigned = 0;
    let unassigned = 0;
    let mileageSum = 0;
    let mileageCount = 0;

    for (const v of vehicles) {
      // statut
      switch (v.status) {
        case "ACTIVE":
          active++;
          break;
        case "IN_MAINTENANCE":
          inMaintenance++;
          break;
        case "INACTIVE":
          inactive++;
          break;
        case "RETIRED":
          retired++;
          break;
      }

      // affectation
      if (v.assignedToName) assigned++;
      else unassigned++;

      // kilométrage
      if (typeof v.currentMileage === "number") {
        mileageSum += v.currentMileage;
        mileageCount++;
      }
    }

    const avgMileage =
      mileageCount > 0 ? Math.round(mileageSum / mileageCount) : 0;

    return {
      active,
      inMaintenance,
      inactive,
      retired,
      assigned,
      unassigned,
      avgMileage,
    };
  }, [vehicles]);

  const {
    data: docsData,
    isLoading: isLoadingDocs,
    isError: isDocsError,
  } = useVehicleDocumentsMonitoring();

  const docs: VehicleDocument[] = docsData ?? [];
  const docKpis = useMemo(() => computeDocumentKpis(docs), [docs]);

  const isLoadingKpis = isLoading || isLoadingDocs;
  const hasError = isError;

  return (
    <div className="space-y-4">
      {/* Bloc résumé global */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">
          Parc automobile
        </p>

        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            total
          )}
        </p>

        {hasError ? (
          <p className="mt-1 text-xs text-destructive">
            Impossible de charger les indicateurs véhicules.
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Vue d&apos;ensemble du parc (statut, affectation, kilométrage).
          </p>
        )}
      </div>

      {/* Statuts */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Actifs" value={active} loading={isLoadingKpis} />
        <KpiCard
          label="En maintenance"
          value={inMaintenance}
          loading={isLoadingKpis}
        />
        <KpiCard label="Inactifs" value={inactive} loading={isLoadingKpis} />
        <KpiCard label="Retirés" value={retired} loading={isLoadingKpis} />
      </div>

      {/* Affectation */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Affectés"
          value={assigned}
          loading={isLoadingKpis}
          subtitle="Véhicules attribués à un agent"
        />
        <KpiCard
          label="Non affectés"
          value={unassigned}
          loading={isLoadingKpis}
          subtitle="Véhicules disponibles"
        />
      </div>

      {/* Kilométrage moyen */}
      <div className="grid grid-cols-1 gap-3">
        {/* <KpiCard
          label="Km moyen"
          value={avgMileage}
          loading={isLoadingKpis}
          subtitle="Kilométrage moyen des véhicules renseignés"
          valueFormatter={(v) => (v ? `${v.toLocaleString("fr-FR")} km` : "--")}
        /> */}
      </div>

      {/* Placeholder pour plus tard : couverture documents */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Documents du parc
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {isLoadingDocs ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                docKpis.total
              )}
            </p>
          </div>
        </div>

        {isDocsError ? (
          <p className="mt-1 text-xs text-destructive">
            Impossible de charger les documents.
          </p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <SmallStat
                label="Expirés"
                value={docKpis.expired}
                tone="danger"
              />
              <SmallStat label="Bientôt" value={docKpis.soon} tone="warning" />
              <SmallStat label="Valides" value={docKpis.valid} tone="success" />
            </div>

            <div className="mt-3 space-y-1.5">
              {(Object.keys(docKpis.byType) as (keyof typeof docKpis.byType)[])
                .filter((t) => docKpis.byType[t] > 0)
                .map((t) => (
                  <div
                    key={t}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-muted-foreground">
                      {getDocTypeLabel(t as VehicleDocumentType)}
                    </span>
                    <span className="font-mono">
                      {docKpis.byType[t].toString().padStart(2, "0")}
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({
  label,
  value,
  loading,
  subtitle,
  valueFormatter,
}: {
  label: string;
  value: number;
  loading?: boolean;
  subtitle?: string;
  valueFormatter?: (v: number) => string;
}) => (
  <div
    className={`rounded-lg border bg-card px-3 py-2 ${
      loading ? "opacity-60 animate-pulse" : ""
    }`}
  >
    <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-bold tabular-nums">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : valueFormatter ? (
        valueFormatter(value)
      ) : (
        value
      )}
    </p>

    {subtitle && (
      <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
        {subtitle}
      </p>
    )}
  </div>
);

const SmallStat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warning" | "success";
}) => {
  const toneClass =
    tone === "danger"
      ? "text-red-600 dark:text-red-400"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="rounded-md border bg-muted/40 px-2 py-1.5">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
    </div>
  );
};

export default VehiclesSidebarContent;
