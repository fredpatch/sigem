import {
  Car,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Users,
  Fuel,
  Gauge,
  BarChart3,
  PieChart,
} from "lucide-react";
import { motion } from "framer-motion";

import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell } from "recharts";

// À adapter selon tes chemins réels
import { useVehicles } from "./hooks/use-vehicle";
import { useVehicleTasks } from "./hooks/use-vehicle-tasks";
import { VehicleTask } from "./types/types";
import { Vehicle } from "./types/vehicle.types";
import { StatCard } from "../assets/_components/stats-card";
import { ENERGY_COLORS, USAGE_COLORS } from "@/constants";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  getTopDueSoonTasks,
  getTopOverdueTasks,
  uniqueByVehicle,
} from "@/utils/helpers";
import { UrgentTaskItem } from "../assets/_components/urgent-task-items";
import { Badge } from "@/components/ui/badge";
// import { useNavigate } from "react-router-dom";

const OPEN_STATUSES = ["PLANNED", "DUE_SOON", "OVERDUE"] as const;

export const VehicleKPIDashboard = () => {
  // const navigate = useNavigate();

  // === DATA FETCH ===
  const { list: vehicleList } = useVehicles();
  const { data: vehiclesData } = vehicleList;
  const vehicles: Vehicle[] = vehiclesData?.items || [];

  const { items: tasksData } = useVehicleTasks(); // éventuellement: useVehicleTasks({ status: "OPEN" })
  // const { data: tasksData } = taskList;
  const tasks: VehicleTask[] = tasksData || [];

  // === BASIC VEHICLE STATS ===
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;
  const inactiveVehicles = totalVehicles - activeVehicles;

  const assignedVehicles = vehicles.filter(
    (v) => v.assignedToEmployeeId || v.assignedToName
  ).length;

  const assignmentRate =
    activeVehicles > 0
      ? Math.round((assignedVehicles / activeVehicles) * 100)
      : 0;

  // Kilométrage
  const totalMileage = vehicles.reduce(
    (sum, v) => sum + (v.currentMileage || 0),
    0
  );
  const avgMileage =
    activeVehicles > 0 ? Math.round(totalMileage / activeVehicles) : 0;

  // === TASK STATS ===
  const openTasks = tasks.filter((t) =>
    OPEN_STATUSES.includes(t.status as (typeof OPEN_STATUSES)[number])
  );

  const dueSoonTasks = openTasks.filter((t) => t.status === "DUE_SOON");
  const overdueTasks = openTasks.filter((t) => t.status === "OVERDUE");

  const topOverdue = uniqueByVehicle(getTopOverdueTasks(openTasks, 8), 5);
  const topDueSoon = uniqueByVehicle(getTopDueSoonTasks(openTasks, 8), 5);

  // console.log("VEHICLE OVERDUE TASKS:", overdueTasks);
  // console.log("VEHICLE DUE SOON TASKS:", dueSoonTasks);

  // console.log(topOverdue, topDueSoon);

  const vehiclesWithOverdue = new Set(
    overdueTasks.map((t) => t.vehicleId?.toString?.() ?? t.vehicleId)
  ).size;

  // Fleet compliance = % de véhicules SANS tâche overdue
  const vehiclesWithoutOverdue =
    totalVehicles > 0 ? totalVehicles - vehiclesWithOverdue : 0;
  const fleetCompliance =
    totalVehicles > 0
      ? Math.round((vehiclesWithoutOverdue / totalVehicles) * 100)
      : 0;

  // const openVehicle = (vehicleId: string) => {
  //   console.log("CLICKED");
  //   // adapte selon tes routes
  //   navigate(`/mg/vehicles/${vehicleId}`);
  // };

  // const openTask = (taskId: string) => {
  //   // adapte si tu as une page task
  //   navigate(`/mg/vehicle-tasks/${taskId}`);
  // };

  // === BREAKDOWN PAR USAGE TYPE ===
  const byUsageType = vehicles.reduce(
    (acc, v) => {
      const key = v.usageType || "UNKNOWN";
      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    },
    {} as Record<string, number>
  );

  // === BREAKDOWN PAR ÉNERGIE ===
  const byEnergy = vehicles.reduce(
    (acc, v) => {
      const key = v.energy || "UNKNOWN";
      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    },
    {} as Record<string, number>
  );

  const usageChartData = Object.entries(byUsageType).map(([usage, count]) => ({
    usage,
    count,
  }));

  const energyChartData = Object.entries(byEnergy).map(([energy, count]) => ({
    energy,
    count,
  }));

  const usageChartConfig = {
    FONCTION: { label: "Fonction", color: "#2563eb" },
    SERVICE: { label: "Service", color: "#0f766e" },
    UNKNOWN: { label: "Non renseigné", color: "#6b7280" },
  } satisfies ChartConfig;

  const energyChartConfig = {
    DIESEL: { label: "Diesel", color: "#047857" },
    ESSENCE: { label: "Essence", color: "#b91c1c" },
    HYBRIDE: { label: "Hybride", color: "#7c3aed" },
    ELECTRIQUE: { label: "Électrique", color: "#0ea5e9" },
    UNKNOWN: { label: "Non renseigné", color: "#6b7280" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* === OVERVIEW CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Car}
          label="Total véhicules"
          value={totalVehicles}
          subtitle={`${activeVehicles} actifs · ${inactiveVehicles} inactifs`}
          delay={0}
        />

        <StatCard
          icon={Users}
          label="Taux d’affectation"
          value={`${assignmentRate}%`}
          subtitle={`${assignedVehicles} véhicules affectés`}
          color={
            assignmentRate >= 80
              ? "text-green-600"
              : assignmentRate >= 50
                ? "text-orange-600"
                : "text-red-600"
          }
          delay={0.1}
        />

        <StatCard
          icon={CheckCircle2}
          label="Conformité du parc"
          value={`${fleetCompliance}%`}
          subtitle={`${vehiclesWithoutOverdue} sans retard`}
          color={
            fleetCompliance >= 80
              ? "text-green-600"
              : fleetCompliance >= 60
                ? "text-orange-600"
                : "text-red-600"
          }
          delay={0.2}
        />

        <StatCard
          icon={Gauge}
          label="Kilométrage moyen"
          value={
            avgMileage > 0 ? `${avgMileage.toLocaleString("fr-FR")} km` : "N/A"
          }
          subtitle={`${totalMileage.toLocaleString("fr-FR")} km cumulés`}
          delay={0.3}
        />
      </div>

      {/* === TOP URGENCES === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Top urgences</h3>
          {/* <span className="text-xs text-muted-foreground">(priorités MG)</span> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: OVERDUE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">En retard</h4>
              <Badge variant="destructive">{topOverdue.length}</Badge>
            </div>

            {topOverdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun retard détecté 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {topOverdue.map((t: any) => (
                  <UrgentTaskItem
                    key={t._id ?? `${t.vehicleId}-${t.type}`}
                    task={t}
                    variant="danger"
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DUE SOON */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">À échéance proche</h4>
              <Badge variant="secondary">{topDueSoon.length}</Badge>
            </div>

            {topDueSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune échéance proche pour le moment.
              </p>
            ) : (
              <div className="space-y-2">
                {topDueSoon.map((t: any) => (
                  <UrgentTaskItem
                    key={t._id ?? `${t.vehicleId}-${t.type}`}
                    task={t}
                    variant="warning"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* === TASK STATUS BREAKDOWN === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">
            Suivi des tâches de maintenance
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[10px] uppercase font-semibold text-blue-700 dark:text-blue-400">
                Tâches ouvertes
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {openTasks.length}
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-400">
                Bientôt dues
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {dueSoonTasks.length}
            </p>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              <span className="text-[10px] uppercase font-semibold text-red-700 dark:text-red-400">
                En retard
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
              {overdueTasks.length}
            </p>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Car className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-[10px] uppercase font-semibold text-purple-700 dark:text-purple-400">
                Véhicules à risque
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 tabular-nums">
              {vehiclesWithOverdue}
            </p>
          </div>
        </div>
      </motion.div>

      {/* === USAGE TYPE & ENERGY === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Par usage type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Répartition par usage</h3>
          </div>

          {/* Bar chart usage */}
          <div className="h-48 mb-4">
            {usageChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun véhicule renseigné pour le moment.
              </p>
            ) : (
              <ChartContainer config={usageChartConfig}>
                <BarChart
                  layout="vertical"
                  data={usageChartData}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <YAxis
                    dataKey={"usage"}
                    type="category"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tickFormatter={(v: string) =>
                      v === "UNKNOWN" ? "Non renseigné" : v
                    }
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value: any) => {
                          return [`${value} véhicule(s)`, " Total"];
                        }}
                        labelFormatter={(label: any) => {
                          return `Usage : ${label === "UNKNOWN" ? "Non renseigné" : label}`;
                        }}
                        indicator="line"
                        hideLabel
                      />
                    }
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {usageChartData.map((entry) => (
                      <Cell
                        key={entry.usage}
                        fill={
                          USAGE_COLORS[entry.usage] ?? "hsl(var(--primary))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </div>

          {/* Liste usage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {Object.entries(byUsageType).map(([usage, count]) => {
              const percentage =
                totalVehicles > 0
                  ? Math.round((count / totalVehicles) * 100)
                  : 0;

              const color =
                USAGE_COLORS[usage] ?? "hsl(var(--muted-foreground))";
              const label = usage === "UNKNOWN" ? "Non renseigné" : usage;

              return (
                <div
                  key={usage}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg border bg-white/80"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="mt-1">
                      <LegendDot color={color} />
                    </div>
                    <div>
                      <p className="font-semibold text-[12px]">{label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {percentage}% du parc
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold tabular-nums">{count}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Par énergie */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Fuel className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Répartition par énergie</h3>
          </div>

          {/* Bar chart énergie */}
          <div className="h-48 mb-4">
            {energyChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun véhicule renseigné pour le moment.
              </p>
            ) : (
              <ChartContainer config={energyChartConfig}>
                <BarChart
                  layout="vertical"
                  data={energyChartData}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <YAxis
                    dataKey="energy"
                    type="category"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />

                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value: any) => {
                          return [`${value} véhicule(s)`, " Total"];
                        }}
                        indicator="line"
                      />
                    }
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {energyChartData.map((entry) => (
                      <Cell
                        key={entry.energy}
                        fill={
                          ENERGY_COLORS[entry.energy] ?? "hsl(var(--primary))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </div>

          {/* Liste énergie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {Object.entries(byEnergy).map(([energy, count]) => {
              const percentage =
                totalVehicles > 0
                  ? Math.round((count / totalVehicles) * 100)
                  : 0;

              const color =
                ENERGY_COLORS[energy] ?? "hsl(var(--muted-foreground))";
              const label = energy === "UNKNOWN" ? "Non renseigné" : energy;
              return (
                <div
                  key={energy}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg border bg-white/80"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="mt-1">
                      <LegendDot color={color} />
                    </div>

                    <div>
                      <p className="font-semibold text-[12px]">{label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {percentage}% du parc
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold tabular-nums">{count}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const LegendDot = ({ color }: { color: string }) => (
  <span
    className="inline-block h-4.5 w-[3px] rounded-2xl"
    style={{ backgroundColor: color }}
  />
);
