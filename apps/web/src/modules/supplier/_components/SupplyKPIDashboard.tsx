/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliesDashboard } from "../hooks/supplies.queries";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  Package,
  ShoppingCart,
  BadgePercent,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SCHEDULED: "Planifié",
  WAITING_QUOTE: "En attente de devis",
  WAITING_INVOICE: "En attente de facture",
  ORDERED: "Commandé",
  DELIVERED: "Livré",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

function fmtXaf(n: number) {
  return `${Number(n ?? 0).toLocaleString()} XAF`;
}

export function SupplyKPIDashboard({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const q = useSuppliesDashboard({ from, to });

  const dto = q.data;

  const byStatus = dto?.plans?.byStatus ?? {};
  const statusPie = useMemo(() => {
    return Object.entries(byStatus)
      .map(([k, v]) => ({
        name: STATUS_LABELS[k] ?? k,
        value: Number(v ?? 0),
      }))
      .filter((x) => x.value > 0);
  }, [byStatus]);

  const topSuppliers = useMemo(() => {
    return (dto?.plans?.topSuppliers ?? []).map((x: any) => ({
      name: x.supplierName ?? x.supplierId, // si plus tard tu enrichis côté UI
      amount: Number(x.amount ?? 0),
    }));
  }, [dto]);

  const topItems = useMemo(() => {
    return (dto?.items?.topItems ?? []).map((x: any) => ({
      name: x.itemLabel ?? x.itemId,
      amount: Number(x.amount ?? 0),
      qty: Number(x.quantitySum ?? 0),
    }));
  }, [dto]);

  const kpi = {
    plansCount: Number(dto?.plans?.count ?? 0),
    plansAmount: Number(dto?.plans?.totalAmount ?? 0),
    missingPrices: Number(dto?.plans?.withMissingPricesCount ?? 0),
    itemsTotal: Number(dto?.items?.totalCount ?? 0),
    itemsActive: Number(dto?.items?.activeCount ?? 0),
    coverage: Number(dto?.items?.coveragePct ?? 0),
    noPriceItems: Number(dto?.items?.withoutAnySupplierPriceCount ?? 0),
    pricesCount: Number(dto?.prices?.count ?? 0),
    updated30d: Number(dto?.prices?.updated30d ?? 0),
  };

  if (q.isLoading) {
    return (
      <div className="space-y-3 w-full">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[92px] rounded-xl" />
          <Skeleton className="h-[92px] rounded-xl" />
          <Skeleton className="h-[92px] rounded-xl" />
          <Skeleton className="h-[92px] rounded-xl" />
        </div>
        <Skeleton className="h-[220px] rounded-xl" />
        <Skeleton className="h-[220px] rounded-xl" />
      </div>
    );
  }

  if (q.isError) {
    return (
      <Card className="p-4 border-destructive/40">
        <div className="text-sm text-destructive">
          Erreur KPI fournitures: {String((q.error as any)?.message ?? "")}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Prévisions</div>
              <div className="text-2xl font-bold">{kpi.plansCount}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Total:{" "}
                <span className="font-medium text-foreground">
                  {fmtXaf(kpi.plansAmount)}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">
                Couverture prix
              </div>
              <div className="text-2xl font-bold">{kpi.coverage}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                Sans prix:{" "}
                <span className="font-medium text-foreground">
                  {kpi.noPriceItems}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <BadgePercent className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Articles</div>
              <div className="text-2xl font-bold">{kpi.itemsActive}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Total catalogue:{" "}
                <span className="font-medium text-foreground">
                  {kpi.itemsTotal}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Anomalies</div>
              <div className="text-2xl font-bold">{kpi.missingPrices}</div>
              <div className="text-xs text-muted-foreground mt-1">
                prix MAJ (30j):{" "}
                <span className="font-medium text-foreground">
                  {kpi.updated30d}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      {/* PIE: STATUTS */}
      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Répartition par statut</div>
            <div className="text-xs text-muted-foreground">
              Sur la période sélectionnée
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {statusPie.reduce((a, b) => a + b.value, 0)} plans
          </Badge>
        </div>

        <div className="mt-3 h-[220px]">
          {statusPie.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Aucune donnée sur la période.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* BAR: TOP */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Top fournisseurs</div>
              <div className="text-xs text-muted-foreground">
                Montant cumulé
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-3 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSuppliers}>
                <XAxis dataKey="name" hide />
                <YAxis width={44} />
                <Tooltip />
                <Bar dataKey="amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Top articles</div>
              <div className="text-xs text-muted-foreground">
                Montant cumulé
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-3 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems}>
                <XAxis dataKey="name" hide />
                <YAxis width={44} />
                <Tooltip />
                <Bar dataKey="amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
