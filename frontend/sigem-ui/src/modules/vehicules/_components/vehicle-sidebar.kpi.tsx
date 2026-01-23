// src/modules/vehicules/_components/vehicles-sidebar-content.tsx
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { MGMaintenanceRow } from "../types/mg.types";
import { useQueryClient } from "@tanstack/react-query";
import { computeMgSidebarKpis } from "../hooks/use-mg-kpis";

const MG_TABLE_QUERY_KEY = ["vehicles", "mg-table"];

const VehiclesSidebarContent = () => {
  const qc = useQueryClient();

  const rows =
    (qc.getQueryData(MG_TABLE_QUERY_KEY) as MGMaintenanceRow[] | undefined) ??
    [];

  // si tu veux savoir si ça charge encore:
  const isFetching = qc.isFetching({ queryKey: MG_TABLE_QUERY_KEY }) > 0;

  const kpis = useMemo(() => computeMgSidebarKpis(rows), [rows]);

  return (
    <div className="space-y-4">
      {/* Parc */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">Parc MG</p>

        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {isFetching ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            kpis.total
          )}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Vue MG (docs + maintenance + affectation)
        </p>
      </div>

      {/* Urgences */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Urgences"
          value={kpis.urgent}
          loading={isFetching}
          subtitle="Docs expirés/bientôt + vidanges dues"
        />
        <KpiCard
          label="Conformité"
          value={kpis.docs.compliancePct}
          loading={isFetching}
          subtitle="% documents valides"
          valueFormatter={(v) => `${v}%`}
        />
      </div>

      {/* Documents */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">
          Documents du parc
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <SmallStat label="Expirés" value={kpis.docs.expired} tone="danger" />
          <SmallStat label="Bientôt" value={kpis.docs.soon} tone="warning" />
          <SmallStat label="Valides" value={kpis.docs.valid} tone="success" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <KpiCard
            label="Assurance expirée"
            value={kpis.docs.byType.insurance.expired}
            loading={isFetching}
          />
          <KpiCard
            label="Visite tech expirée"
            value={kpis.docs.byType.tech.expired}
            loading={isFetching}
          />
          <KpiCard
            label="Parking expiré"
            value={kpis.docs.byType.parking.expired}
            loading={isFetching}
          />
          <KpiCard
            label="Extincteur expiré"
            value={kpis.docs.byType.extinguisher.expired}
            loading={isFetching}
          />
        </div>
      </div>

      {/* Vidanges */}
      <div className="grid grid-cols-3 gap-3">
        <SmallStat label="Vidange due" value={kpis.oil.overdue} tone="danger" />
        <SmallStat
          label="Vidange bientôt"
          value={kpis.oil.soon}
          tone="warning"
        />
        <SmallStat label="Vidange ?" value={kpis.oil.missing} />
      </div>

      {/* Affectation */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Affectés" value={kpis.assigned} loading={isFetching} />
        <KpiCard
          label="Non affectés"
          value={kpis.unassigned}
          loading={isFetching}
        />
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
