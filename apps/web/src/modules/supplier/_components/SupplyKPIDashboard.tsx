/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, type ReactNode } from "react";
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
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  Package,
  ShoppingCart,
  BadgePercent,
  AlertTriangle,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SCHEDULED: "Planifie",
  WAITING_QUOTE: "En attente de devis",
  WAITING_INVOICE: "En attente de facture",
  ORDERED: "Commande",
  DELIVERED: "Livre",
  COMPLETED: "Termine",
  CANCELLED: "Annule",
};

const STATUS_COLORS = [
  "#0f766e",
  "#14b8a6",
  "#f59e0b",
  "#f97316",
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#dc2626",
];

function fmtXaf(n: number) {
  return `${Number(n ?? 0).toLocaleString()} XAF`;
}

function fmtShortXaf(n: number) {
  const value = Number(n ?? 0);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M XAF`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} k XAF`;
  return fmtXaf(value);
}

function fmtMonthLabel(month: string) {
  const [year, rawMonth] = month.split("-");
  const date = new Date(Date.UTC(Number(year), Number(rawMonth) - 1, 1));
  return date.toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  primary = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  primary?: boolean;
}) {
  return (
    <Card
      className={
        primary
          ? "p-3.5 rounded-xl shadow-sm border-primary/15 bg-primary/5"
          : "p-3.5 rounded-xl shadow-sm bg-background"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/80">
            {title}
          </div>
          <div
            className={
              primary
                ? "text-[1.35rem] leading-none font-semibold mt-1.5"
                : "text-xl leading-none font-semibold mt-1.5 text-foreground/90"
            }
          >
            {value}
          </div>
          <div className="text-[11px] leading-4 text-muted-foreground mt-1.5">
            {subtitle}
          </div>
        </div>
        <div
          className={
            primary
              ? "p-2 rounded-lg bg-primary/12 text-primary"
              : "p-2 rounded-lg bg-muted text-muted-foreground"
          }
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ChartTooltipCard({
  active,
  label,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{
    color?: string;
    name?: NameType;
    value?: ValueType;
  }>;
  valueFormatter?: (value: number, name?: string) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[150px] rounded-lg border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      {label ? (
        <div className="mb-1.5 text-[11px] font-medium text-foreground/80">
          {label}
        </div>
      ) : null}

      <div className="space-y-1">
        {payload.map((entry, index) => {
          const numericValue = Number(entry.value ?? 0);
          const name = String(entry.name ?? "");

          return (
            <div
              key={`${name}-${index}`}
              className="flex items-center justify-between gap-3 text-[11px]"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color ?? "currentColor" }}
                />
                <span>{name}</span>
              </div>
              <span className="font-medium text-foreground">
                {valueFormatter
                  ? valueFormatter(numericValue, name)
                  : numericValue.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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

  const statusAmountPie = useMemo(() => {
    const byStatusAmount = dto?.plans?.byStatusAmount ?? {};
    return Object.entries(byStatusAmount)
      .map(([status, amount]) => ({
        name: STATUS_LABELS[status] ?? status,
        value: Number(amount ?? 0),
      }))
      .filter((item) => item.value > 0);
  }, [dto?.plans?.byStatusAmount]);

  const topSuppliers = useMemo(() => {
    return (dto?.plans?.topSuppliers ?? []).map((x: any) => ({
      name: x.supplierName ?? x.supplierId,
      amount: Number(x.amount ?? 0),
      plansCount: Number(x.plansCount ?? 0),
    }));
  }, [dto?.plans?.topSuppliers]);

  const topItems = useMemo(() => {
    return (dto?.items?.topItems ?? []).map((x: any) => ({
      name: x.label ?? x.itemId,
      amount: Number(x.amount ?? 0),
      qty: Number(x.quantitySum ?? 0),
    }));
  }, [dto?.items?.topItems]);

  const trend = useMemo(() => {
    return (dto?.plans?.monthlyTrend ?? []).map((x: any) => ({
      month: String(x.month),
      label: fmtMonthLabel(String(x.month)),
      amount: Number(x.amount ?? 0),
      count: Number(x.count ?? 0),
    }));
  }, [dto?.plans?.monthlyTrend]);

  const kpi = {
    plansCount: Number(dto?.plans?.count ?? 0),
    activePlans: Number(dto?.plans?.activeCount ?? 0),
    plansAmount: Number(dto?.plans?.totalAmount ?? 0),
    topSupplierSharePct: Number(dto?.plans?.topSupplierSharePct ?? 0),
    atRiskPlans: Number(dto?.plans?.atRiskCount ?? 0),
    coverage: Number(dto?.items?.coveragePct ?? 0),
    noPriceItems: Number(dto?.items?.withoutAnySupplierPriceCount ?? 0),
    itemsAtRisk: Number(dto?.items?.atRiskCount ?? 0),
    stalePrices: Number(dto?.prices?.staleCount ?? 0),
    updated30d: Number(dto?.prices?.updated30d ?? 0),
  };

  if (q.isLoading) {
    return (
      <div className="space-y-3 w-full">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <Skeleton className="h-[92px] rounded-xl" />
          <Skeleton className="h-[92px] rounded-xl" />
          <Skeleton className="h-[92px] rounded-xl" />
          <Skeleton className="h-[92px] rounded-xl" />
        </div>
        <Skeleton className="h-[260px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
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
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <KpiCard
          title="Montant prevu"
          value={fmtShortXaf(kpi.plansAmount)}
          subtitle={`${kpi.plansCount} plans sur la periode`}
          icon={<CircleDollarSign className="h-5 w-5" />}
          primary
        />

        <KpiCard
          title="Plans actifs"
          value={String(kpi.activePlans)}
          subtitle={`${kpi.atRiskPlans} plans a risque`}
          icon={<ShoppingCart className="h-5 w-5" />}
        />

        <KpiCard
          title="Couverture prix"
          value={`${kpi.coverage}%`}
          subtitle={`${kpi.noPriceItems} articles sans prix`}
          icon={<BadgePercent className="h-5 w-5" />}
        />

        <KpiCard
          title="Articles a risque"
          value={String(kpi.itemsAtRisk)}
          subtitle={`${kpi.stalePrices} prix obsoletes`}
          icon={<Package className="h-5 w-5" />}
        />

        <KpiCard
          title="Dependance fournisseur"
          value={`${kpi.topSupplierSharePct}%`}
          subtitle={`${kpi.updated30d} prix mis a jour sur 30j`}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <Separator />

      <div className="grid xl:grid-cols-[1.4fr_1fr] gap-4">
        <Card className="p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.02em]">
                Tendance mensuelle
              </div>
              <div className="text-[11px] text-muted-foreground">
                Volume et montant des plans crees
              </div>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full text-[10px] font-medium"
            >
              {trend.length} mois
            </Badge>
          </div>

          <div className="mt-2.5 h-[220px]">
            {trend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Aucune donnee sur la periode.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.45}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    yAxisId="left"
                    width={52}
                    tickFormatter={fmtShortXaf}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    width={28}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <ChartTooltipCard
                        active={active}
                        label={String(label ?? "")}
                        payload={payload as any}
                        valueFormatter={(value, name) =>
                          name === "amount" ? fmtXaf(value) : String(value)
                        }
                      />
                    )}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="count"
                    name="count"
                    radius={[4, 4, 0, 0]}
                    fill="#bfdbfe"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    name="amount"
                    stroke="#0f766e"
                    strokeWidth={2.25}
                    dot={{ r: 2.5, strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.02em]">
                Montant par statut
              </div>
              <div className="text-[11px] text-muted-foreground">
                Repartition budgetaire plutot que simple comptage
              </div>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full text-[10px] font-medium"
            >
              {fmtShortXaf(kpi.plansAmount)}
            </Badge>
          </div>

          <div className="mt-2.5 h-[220px]">
            {statusAmountPie.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Aucune donnee sur la periode.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusAmountPie}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={72}
                    innerRadius={50}
                  >
                    {statusAmountPie.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => (
                      <ChartTooltipCard
                        active={active}
                        payload={payload as any}
                        valueFormatter={(value) => fmtXaf(value)}
                      />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {statusAmountPie.map((item, index) => (
              <Badge
                key={item.name}
                variant="outline"
                className="rounded-full gap-1.5 text-[10px] font-medium text-muted-foreground"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[index % STATUS_COLORS.length],
                  }}
                />
                {item.name}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <Card className="p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.02em]">
                Top fournisseurs
              </div>
              <div className="text-[11px] text-muted-foreground">
                Concentration du montant engage
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-2.5 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topSuppliers}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                  opacity={0.35}
                />
                <XAxis
                  type="number"
                  tickFormatter={fmtShortXaf}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, label, payload }) => (
                    <ChartTooltipCard
                      active={active}
                      label={String(label ?? "")}
                      payload={payload as any}
                      valueFormatter={(value) => fmtXaf(value)}
                    />
                  )}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.02em]">
                Top articles
              </div>
              <div className="text-[11px] text-muted-foreground">
                Articles les plus consommateurs de budget
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-2.5 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topItems}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                  opacity={0.35}
                />
                <XAxis
                  type="number"
                  tickFormatter={fmtShortXaf}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, label, payload }) => (
                    <ChartTooltipCard
                      active={active}
                      label={String(label ?? "")}
                      payload={payload as any}
                      valueFormatter={(value) => fmtXaf(value)}
                    />
                  )}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
