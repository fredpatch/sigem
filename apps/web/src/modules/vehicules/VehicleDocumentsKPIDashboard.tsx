import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  PieChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatCard } from "../assets/_components/stats-card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell } from "recharts";
import { useVehicleDocumentsKpis } from "./hooks/use-vehicle-documents";

const DOC_LABELS: Record<string, string> = {
  INSURANCE: "Assurance",
  TECH_INSPECTION: "Visite technique",
  REGISTRATION: "Carte grise",
  TAX_STICKER: "Vignette",
  PARKING_CARD: "Carte parking",
  EXTINGUISHER_CARD: "Carte extincteur",
  OTHER: "Autre",
};

const DOC_COLORS: Record<string, string> = {
  INSURANCE: "#3b82f6",
  TECH_INSPECTION: "#10b981",
  REGISTRATION: "#f59e0b",
  TAX_STICKER: "#ef4444",
  PARKING_CARD: "#8b5cf6",
  EXTINGUISHER_CARD: "#6b7280",
  OTHER: "#6b7280",
};

const MotionDiv = motion.div;

export const VehicleDocumentsKPIDashboard = ({
  soonDays = 30,
}: {
  soonDays?: number;
}) => {
  const { data, isLoading, isError } = useVehicleDocumentsKpis(soonDays);

  const kpis = data ?? {
    activeVehicles: 0,
    totalDocuments: 0,
    activeDocsCount: 0,
    expiredCount: 0,
    expiringSoonCount: 0,
    vehiclesWithDocs: 0,
    vehiclesWithExpired: 0,
    vehiclesMissingRequired: 0,
    compliantVehicles: 0,
    compliance: 0,
    complianceTrend: {
      compliance7dAgo: 0,
      compliance30dAgo: 0,
      points7d: 0,
      points30d: 0,
      pct7d: 0,
      pct30d: 0,
    },
    noReminder: 0,
    byType: {} as Record<string, number>,
    typeChartData: [] as Array<{ type: string; count: number }>,
    topUrgentDocs: [] as any[],
  };

  const typeChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    for (const k of Object.keys(kpis.byType)) {
      cfg[k] = {
        label: DOC_LABELS[k] ?? k,
        color: DOC_COLORS[k] ?? "hsl(var(--primary))",
      };
    }
    return cfg;
  }, [kpis.byType]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">Chargement des documents...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Impossible de charger le monitoring des documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Documents actifs"
          value={kpis.activeDocsCount}
          subtitle={`${kpis.totalDocuments} au total`}
          delay={0}
        />

        <StatCard
          icon={ShieldAlert}
          label="Documents expires"
          value={kpis.expiredCount}
          subtitle={`${kpis.vehiclesWithExpired} vehicule(s) a risque`}
          color={kpis.expiredCount > 0 ? "text-red-600" : "text-green-600"}
          delay={0.1}
        />

        <StatCard
          icon={Clock}
          label={`Expire sous ${soonDays}j`}
          value={kpis.expiringSoonCount}
          subtitle="Echeances proches"
          color={kpis.expiringSoonCount > 0 ? "text-orange-600" : "text-green-600"}
          delay={0.2}
        />

        <StatCard
          icon={CheckCircle2}
          label="Conformite documents"
          value={`${kpis.compliance}%`}
          subtitle={`${kpis.compliantVehicles}/${kpis.activeVehicles} vehicules conformes`}
          trend={kpis.complianceTrend?.pct7d ?? 0}
          color={
            kpis.compliance >= 85
              ? "text-green-600"
              : kpis.compliance >= 65
                ? "text-orange-600"
                : "text-red-600"
          }
          delay={0.3}
        />
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Documents a traiter</h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">Incomplets: {kpis.vehiclesMissingRequired}</Badge>
            <Badge variant={kpis.noReminder > 0 ? "destructive" : "secondary"}>
              Sans rappel: {kpis.noReminder}
            </Badge>
          </div>
        </div>

        {kpis.topUrgentDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun document urgent.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {kpis.topUrgentDocs.map((d: any) => {
              const exp = new Date(d.expiresAt);
              const isExpired = exp < new Date();
              const labelType = DOC_LABELS[d.type] ?? d.type;
              const vehicle = typeof d.vehicleId === "object" ? d.vehicleId : null;
              const vehicleLabel = `${vehicle?.plateNumber ?? "N/A"} · ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`.trim();

              return (
                <div
                  key={d.id ?? d._id}
                  className={cn(
                    "rounded-lg border p-3 flex items-start justify-between gap-3",
                    isExpired
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-amber-500/20 bg-amber-500/5",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {labelType}
                    </p>
                    <p className="text-sm font-semibold truncate">{vehicleLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      Expire le <span className="font-medium">{exp.toLocaleDateString("fr-FR")}</span>
                    </p>
                  </div>
                  <Badge variant={isExpired ? "destructive" : "secondary"}>
                    {isExpired ? "Expire" : "Bientot"}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Repartition des documents</h3>
        </div>

        {kpis.typeChartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun document enregistre pour le moment.
          </p>
        ) : (
          <div>
            <ChartContainer config={typeChartConfig} className="h-72 w-full aspect-auto">
              <BarChart data={kpis.typeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => DOC_LABELS[v] ?? v}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value: any) => [`${value} doc(s)`, "Total"]}
                      indicator="line"
                    />
                  }
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {kpis.typeChartData.map((entry) => (
                    <Cell
                      key={entry.type}
                      fill={DOC_COLORS[entry.type] ?? "hsl(var(--primary))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </MotionDiv>
    </div>
  );
};
