import { KpiMiniCard } from "./KpiMiniCard";
import { LineStat } from "./LineStat";
import { MiniDonut } from "./MiniDonut";
import { MiniBar } from "./MiniBar";
import { SUPPLY_STATUS_LABEL_FR } from "../supply-status.fr";
import { SupplyPlanStatus } from "../hooks/supply-plan.transitions";

export function SupplySideKPIs({
  data,
  loading,
}: {
  data?: any;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4 lg:sticky lg:top-4">
        <div className="rounded-xl border p-4">Chargement…</div>
      </div>
    );
  }

  const statusLabel = (status: any) =>
    SUPPLY_STATUS_LABEL_FR[status as SupplyPlanStatus] ?? status ?? "Inconnu";

  if (!data) return null;

  const donutData = Object.entries(data.plans?.byStatus ?? {}).map(
    ([name, value]) => ({ name: statusLabel(name), value: Number(value) }),
  );

  const barData = (data.top?.items ?? []).map((x: any) => ({
    name: x.label ?? x.itemId,
    value: Number(x.count ?? 0),
  }));

  return (
    <div className="space-y-4 lg:sticky lg:top-4 py-5">
      {/* Urgences */}
      <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-4 shadow-xl">
        <div className="text-sm font-semibold mb-3">Urgences</div>

        <div className="grid grid-cols-2 gap-3">
          <KpiMiniCard
            label="Prévisions actives"
            value={data.plans?.activeCount ?? 0}
          />
          <KpiMiniCard
            label="Lignes actives"
            value={data.plans?.activeLinesCount ?? 0}
          />
          <KpiMiniCard
            label="Lignes sans prix"
            value={data.plans?.linesMissingPrice ?? 0}
            tone={(data.plans?.linesMissingPrice ?? 0) > 0 ? "danger" : "ok"}
          />
          <KpiMiniCard
            label="Couverture prix"
            value={`${data.prices?.coveragePct ?? 0}%`}
            tone={(data.prices?.coveragePct ?? 0) >= 80 ? "ok" : "warning"}
          />
        </div>
      </div>

      {/* Qualité des prix */}
      <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-4 shadow-xl">
        <div className="text-sm font-semibold mb-3">Qualité des prix</div>

        <div className="space-y-2">
          <LineStat
            label="Articles sans prix"
            value={data.prices?.missingItemsCount ?? 0}
          />
          <LineStat
            label="Prix obsolètes (>30j)"
            value={data.prices?.stalePricesCount ?? 0}
          />
          <LineStat
            label="Dernière MAJ"
            value={
              data.prices?.lastUpdateAt
                ? new Date(data.prices.lastUpdateAt).toLocaleDateString()
                : "-"
            }
          />
        </div>
      </div>

      {/* Mini charts */}
      <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-4 shadow-xl">
        <div className="text-sm font-semibold mb-3">Aperçu</div>
        <div className="space-y-3">
          <MiniDonut title="Plans par statut" data={donutData} />
          <MiniBar title="Top articles" data={barData} />
        </div>
      </div>
    </div>
  );
}
