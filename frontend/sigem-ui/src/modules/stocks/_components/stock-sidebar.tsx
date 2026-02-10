// src/features/stock/_components/stock-sidebar.tsx
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Package,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useStockContextStore } from "../store/use-stock-context.store";
import { useModalStore } from "@/stores/modal-store";
import { useStockKpis } from "../hooks/use-kpi";
import { ModalTypes } from "@/types/modal.types";

function MovementIcon({ type }: { type: "IN" | "OUT" | "ADJUST" }) {
  if (type === "IN")
    return <ArrowDownToLine className="h-4 w-4 text-green-600" />;
  if (type === "OUT")
    return <ArrowUpFromLine className="h-4 w-4 text-red-600" />;
  return <RefreshCw className="h-4 w-4 text-blue-600" />;
}

function MovementBadge({ type }: { type: "IN" | "OUT" | "ADJUST" }) {
  const config = {
    IN: {
      label: "Entrée",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    },
    OUT: {
      label: "Sortie",
      className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    },
    ADJUST: {
      label: "Ajust.",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    },
  };

  const { label, className } = config[type];

  return (
    <Badge variant="outline" className={cn("border-0 text-xs", className)}>
      {label}
    </Badge>
  );
}

export const StockSidebar = () => {
  const { locationId } = useStockContextStore();
  const { openModal } = useModalStore();

  const kpisQ = useStockKpis(locationId);
  const data = kpisQ.data?.data;
  const last = data?.lastMovements ?? [];
  const recent = last.slice(0, 3);

  const below = data?.belowMinCount ?? 0;

  const open = (mode: "IN" | "OUT" | "ADJUST") => {
    if (!locationId) return;
    openModal(ModalTypes.STOCK_MOVEMENT_FORM, { mode, locationId });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Quick actions */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Actions rapides
          </div>

          <div className="grid grid-cols-2 gap-2 -mt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => open("IN")}
                className="w-full justify-start gap-2 h-11 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                <ArrowDownToLine className="h-4 w-4" />
                <span>Entrée</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => open("OUT")}
                className="w-full justify-start gap-2 h-11 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                <ArrowUpFromLine className="h-4 w-4" />
                <span>Sortie</span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="col-span-2"
            >
              <Button
                variant="outline"
                onClick={() => open("ADJUST")}
                className="w-full justify-start gap-2 h-11 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900 dark:hover:bg-blue-950"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Ajustement inventaire</span>
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* KPI Tiles */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Aperçu du stock
          </div>

          <div className="grid grid-cols-2 gap-3 -mt-4">
            <KpiTile
              icon={Package}
              label="Articles"
              value={data?.totalItems ?? 0}
              delay={0}
            />
            <KpiTile
              icon={BarChart3}
              label="Qté totale"
              value={data?.totalQuantity ?? 0}
              delay={0.05}
            />
            <KpiTile
              icon={TrendingDown}
              label="Sous seuil"
              value={below}
              delay={0.1}
              className={cn(
                below > 0 &&
                  "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400",
              )}
              pulse={below > 0}
            />
            <KpiTile
              icon={Calendar}
              label="Dernier"
              value={
                data?.lastMovementAt
                  ? format(new Date(data.lastMovementAt), "dd/MM", {
                      locale: fr,
                    })
                  : "-"
              }
              delay={0.15}
            />
          </div>
        </Card>
      </motion.div>

      {/* Latest movements */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Derniers mouvements
            </div>
            {data?.lastMovementAt && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span>
                  {format(new Date(data.lastMovementAt), "HH:mm", {
                    locale: fr,
                  })}
                </span>
              </div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {!recent.length ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Aucun mouvement récent
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2 -mt-4">
                {recent.map((m: any, index: number) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="rounded-lg border bg-card p-2 flex gap-3 items-start cursor-default transition-shadow hover:shadow-md"
                  >
                    <div className="mt-0.5">
                      <MovementIcon type={m.type} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate font-medium text-sm">
                          {m.supplyItem?.label ?? "Article"}
                        </div>
                        <MovementBadge type={m.type} />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium tabular-nums">
                          Δ {m.delta > 0 ? `+${m.delta}` : m.delta}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="tabular-nums">
                          {m.stockBefore} → {m.stockAfter}
                        </span>
                      </div>

                      {(m.provider?.name || typeof m.unitCost === "number") && (
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          {m.provider?.name && (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                              {m.provider.name}
                            </span>
                          )}
                          {typeof m.unitCost === "number" && (
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                              {formatPrice(m.unitCost)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const KpiTile = ({
  icon: Icon,
  label,
  value,
  className,
  delay = 0,
  pulse = false,
}: {
  icon: any;
  label: string;
  value: any;
  className?: string;
  delay?: number;
  pulse?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={cn(
      "relative rounded-lg border p-2 bg-card transition-all hover:shadow-sm",
      className,
    )}
  >
    {pulse && (
      <motion.div
        className="absolute inset-0 rounded-lg bg-red-500/10"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    )}

    <div className="relative space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  </motion.div>
);

export function formatPrice(value: number) {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
