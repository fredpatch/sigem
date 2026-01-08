import {
  Package,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  Building2,
  Layers,
} from "lucide-react";
import { useAsset } from "../hooks/useAsset";
import { AssetDTO } from "../types/asset-type";
import { StatCard } from "./stats-card";
import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Bar,
  Cell,
} from "recharts";
import { REGION_COLORS } from "@/constants";

export const AssetKPIDashboard = () => {
  const { list } = useAsset();
  const { data: assets } = list;
  const items: AssetDTO[] = assets?.items || []; // Replace with: const items: AssetDTO[] = assets?.items || [];

  // === BASIC STATS ===
  const total = items.length;
  const totalQuantity = items.reduce((sum, a) => sum + (a.quantity || 0), 0);

  // Status breakdown
  const statusCounts = {
    NEUF: items.filter((a) => a.situation === "NEUF").length,
    EN_SERVICE: items.filter((a) => a.situation === "EN_SERVICE").length,
    EN_PANNE: items.filter((a) => a.situation === "EN_PANNE").length,
    HORS_SERVICE: items.filter((a) => a.situation === "HORS_SERVICE").length,
    REFORME: items.filter((a) => a.situation === "REFORME").length,
  };

  // === ADVANCED STATS ===

  // 1. By Family
  // const byFamily = items.reduce(
  //   (acc, item) => {
  //     const family = item.categoryId?.family || "INCONNU";
  //     if (!acc[family]) acc[family] = { count: 0, quantity: 0 };
  //     acc[family].count++;
  //     acc[family].quantity += item.quantity || 0;
  //     return acc;
  //   },
  //   {} as Record<string, { count: number; quantity: number }>
  // );

  // 2. By Category (Top 5)
  const byCategory = items.reduce(
    (acc, item) => {
      const catLabel = item.categoryId?.label || "Sans catégorie";
      if (!acc[catLabel]) acc[catLabel] = { count: 0, quantity: 0 };
      acc[catLabel].count++;
      acc[catLabel].quantity += item.quantity || 0;
      return acc;
    },
    {} as Record<string, { count: number; quantity: number }>
  );

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  // 3. By Location (Localisation level)
  const byLocation = items.reduce(
    (acc, item) => {
      const loc = item.locationId?.localisation || "INCONNU";
      if (!acc[loc]) acc[loc] = 0;
      acc[loc]++;
      return acc;
    },
    {} as Record<string, number>
  );

  // 3bis. By Office (bureau précis)
  const byOffice = items.reduce(
    (acc, item) => {
      const loc = item.locationId;
      if (!loc) return acc;

      // clé unique pour le bureau
      const key =
        loc.code ||
        `${loc.localisation || "?"}/${loc.batiment || "?"}/${loc.direction || "?"}/${loc.bureau || "?"}`;

      if (!acc[key]) {
        acc[key] = {
          count: 0,
          localisation: loc.localisation || "N/A",
          batiment: loc.batiment || "N/A",
          direction: loc.direction || "N/A",
          bureau: loc.bureau || "N/A",
        };
      }

      acc[key].count++;
      return acc;
    },
    {} as Record<
      string,
      {
        count: number;
        localisation: string;
        batiment: string;
        direction: string;
        bureau: string;
      }
    >
  );

  const officesSorted = Object.values(byOffice).sort(
    (a, b) => b.count - a.count
  );

  // 4. Health Score (operational %)
  const operational = statusCounts.EN_SERVICE + statusCounts.NEUF;
  const healthScore = total > 0 ? Math.round((operational / total) * 100) : 0;

  // 5. Issue Rate
  const issues = statusCounts.EN_PANNE + statusCounts.HORS_SERVICE;
  const issueRate = total > 0 ? Math.round((issues / total) * 100) : 0;

  const locationChartData = Object.entries(byLocation).map(
    ([location, count]) => ({
      location,
      count,
    })
  );

  return (
    <div className="space-y-6">
      {/* === OVERVIEW CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Package}
          label="Total du patrimoine"
          value={total}
          subtitle={`${totalQuantity} unités au total`}
          delay={0}
        />

        <StatCard
          icon={CheckCircle2}
          label="Indice de santé"
          value={`${healthScore}%`}
          subtitle={`${operational} biens en état opérationnel`}
          color={
            healthScore >= 80
              ? "text-green-600"
              : healthScore >= 60
                ? "text-orange-600"
                : "text-red-600"
          }
          delay={0.1}
        />

        <StatCard
          icon={AlertTriangle}
          label="Taux d'incident"
          value={`${issueRate}%`}
          subtitle={`${issues} biens nécessitent une attention`}
          color={
            issueRate <= 10
              ? "text-green-600"
              : issueRate <= 25
                ? "text-orange-600"
                : "text-red-600"
          }
          delay={0.2}
        />

        {/* <StatCard
          icon={Layers}
          label="Catégories"
          value={Object.keys(byCategory).length}
          subtitle={`${Object.keys(byFamily).length} familles`}
          delay={0.3}
        /> */}
      </div>

      {/* === STATUS BREAKDOWN === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Répartition par statut</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">
                Neuf
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {statusCounts.NEUF}
            </p>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span className="text-[10px] uppercase font-semibold text-green-700 dark:text-green-400">
                En service
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
              {statusCounts.EN_SERVICE}
            </p>
          </div>

          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-[10px] uppercase font-semibold text-orange-700 dark:text-orange-400">
                En panne
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 tabular-nums">
              {statusCounts.EN_PANNE}
            </p>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-3.5 w-3.5 text-red-600" />
              <span className="text-[10px] uppercase font-semibold text-red-700 dark:text-red-400">
                Hors Service
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
              {statusCounts.HORS_SERVICE}
            </p>
          </div>

          <div className="rounded-lg border border-gray-500/20 bg-gray-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-[10px] uppercase font-semibold text-gray-700 dark:text-gray-400">
                Réformé
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 tabular-nums">
              {statusCounts.REFORME}
            </p>
          </div>
        </div>
      </motion.div>

      {/* === BY FAMILY & TOP CATEGORIES === */}
      <div className="grid grid-cols-1 gap-4">
        {/* By Family */}
        {/* <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Répartition par famille</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(byFamily).map(([family, data]: any) => {
              const config = familyConfig[
                family as keyof typeof familyConfig
              ] || {
                icon: Package,
                label: family,
                color: "text-gray-600",
                bg: "bg-gray-500/10",
                border: "border-gray-500/20",
              };
              const FamilyIcon = config.icon;
              const percentage =
                total > 0 ? Math.round((data.count / total) * 100) : 0;

              return (
                <div
                  key={family}
                  className={`flex items-center justify-between p-3 rounded-lg border ${config.border} ${config.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <FamilyIcon className={`h-5 w-5 ${config.color}`} />
                    <div>
                      <p className={`font-semibold ${config.color}`}>
                        {config.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.quantity} unités
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${config.color} tabular-nums`}
                    >
                      {data.count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div> */}

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Top 5 catégories</h3>
          </div>

          <div className="space-y-2 grid grid-cols-1 gap-2">
            {topCategories.slice(0, 5).map(([category, data]: any, idx) => {
              const percentage =
                total > 0 ? Math.round((data.count / total) * 100) : 0;

              return (
                <div key={category} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <span className="text-xs font-bold text-primary">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{category}</p>
                      <span className="text-sm font-bold tabular-nums ml-2">
                        {data.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium w-10 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* === BY OFFICE (BUREAU) === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Top 5 bureaux équipés</h3>
        </div>

        {officesSorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun bureau renseigné pour le moment.
          </p>
        ) : (
          <div className="space-y-0 grid grid-cols-1 md:grid-cols-2 gap-2">
            {officesSorted.slice(0, 6).map((office, idx) => {
              const percentage =
                total > 0 ? Math.round((office.count / total) * 100) : 0;

              return (
                <div
                  key={`${office.localisation}-${office.batiment}-${office.direction}-${office.bureau}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/40"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {office.localisation} | Bât.
                      {office.batiment}
                    </span>
                    <span className="text-sm font-semibold">
                      {/* {office.direction} –  */}
                      {office.bureau}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {percentage}% du patrimoine total
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums">
                      {office.count}
                    </p>
                    <p className="text-[11px] text-muted-foreground">assets</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* === BY LOCATION === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Répartition par région</h3>
        </div>

        {/* Bar chart (régions) */}
        <div className="h-56 mb-4">
          {locationChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune localisation renseignée pour le moment.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="location"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  cursor={false}
                  formatter={(value: any) => [`${value} biens`, "Total"]}
                  labelFormatter={(label: any) => `Localisation : ${label}`}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  // tu peux utiliser la couleur de ton thème ici
                >
                  {locationChartData.map((entry) => (
                    <Cell
                      key={entry.location}
                      fill={
                        REGION_COLORS[entry.location] ?? "hsl(var(--primary))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(byLocation).map(([location, count]: any) => (
            <div
              key={location}
              className="rounded-lg border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {location}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {count}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {total > 0 ? Math.round((count / total) * 100) : 0}% du total
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
