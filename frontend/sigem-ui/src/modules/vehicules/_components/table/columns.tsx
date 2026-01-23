// vehicle-tasks.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Gauge,
  AlertTriangle,
  AlertCircle,
  // Bell,
  ClipboardList,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import TitleComponent from "@/components/shared/table/title.component";
import { BadgeWithToolTip } from "@/components/shared/badge-tooltip";
import {
  VehicleTask,
  VehicleTaskSeverity,
  VehicleTaskStatus,
  VehicleTaskType,
} from "../../types/types";
import { fr } from "date-fns/locale";
import { VehicleTaskActionCell } from "@/components/shared/table/action.component";

const MotionDiv = motion.div;

export const vehicleTasksColumns: ColumnDef<VehicleTask>[] = [
  // --- SELECT COLUMN ---
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    size: 50,
    enableSorting: false,
  },

  // --- VEHICLE (ID ONLY FOR NOW) ---
  {
    id: "vehicleLabel",
    header: () => (
      <TitleComponent className="flex justify-start" label="Véhicule" />
    ),
    accessorKey: "vehicleLabel", // pour le tri/filtrage
    cell: ({ row }) => {
      const { vehicleId, vehiclePlate, vehicleLabel } = row.original;

      const displayLabel = vehicleLabel || "Véhicule non renseigné";
      const displayPlate = vehiclePlate || "(plaque inconnue)";

      return (
        <MotionDiv
          className="flex items-center gap-3 py-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-foreground/90 truncate">
              {displayLabel}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/80 uppercase tracking-tight">
              {displayPlate}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              ID: {vehicleId}
            </span>
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- TASK LABEL / TYPE ---
  {
    id: "task",
    header: () => (
      <TitleComponent className="flex justify-start" label="Tâche" />
    ),
    accessorKey: "label",
    cell: ({ row }) => {
      const { label, type, description } = row.original;

      const typeLabelMap: Record<VehicleTaskType, string> = {
        OIL_CHANGE: "Vidange",
        MAINTENANCE: "Maintenance",
        DOCUMENT_RENEWAL: "Renouvellement doc.",
        OTHER: "Autre",
      };

      const typeLabel =
        typeLabelMap[type as VehicleTaskType] ?? (type as string);

      return (
        <div className="flex flex-col gap-0.5 min-w-0 max-w-[260px]">
          <span className="text-sm font-medium text-foreground line-clamp-1">
            {label}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {typeLabel}
          </span>
          {description && (
            <span className="text-[11px] text-muted-foreground/80 line-clamp-1">
              {description}
            </span>
          )}
        </div>
      );
    },
    enableSorting: true,
  },

  // --- DUE DATE / MILEAGE ---
  {
    id: "due",
    header: () => (
      <TitleComponent className="flex justify-center" label="Échéance" />
    ),
    accessorKey: "dueAt",
    cell: ({ row }) => {
      const { dueAt, dueMileage } = row.original;

      const hasDate = !!dueAt;
      const hasMileage = typeof dueMileage === "number";

      if (!hasDate && !hasMileage) {
        return (
          <span className="text-[11px] text-muted-foreground italic">
            Aucune échéance définie
          </span>
        );
      }

      return (
        <div className="flex flex-col items-center gap-1">
          {hasDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="text-xs font-medium tabular-nums text-foreground/80">
                {format(new Date(dueAt!), "PP")}
              </span>
            </div>
          )}
          {hasMileage && (
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="text-[11px] font-mono text-muted-foreground">
                {dueMileage?.toLocaleString("fr-FR")} km
              </span>
            </div>
          )}
        </div>
      );
    },
    enableSorting: true,
  },

  // --- STATUS ---
  {
    id: "status",
    header: () => (
      <TitleComponent
        className="flex items-center justify-center"
        label="Statut"
      />
    ),
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;

      const statusConfig: Record<
        VehicleTaskStatus,
        {
          label: string;
          className: string;
          variant: "default" | "secondary" | "destructive" | "outline";
        }
      > = {
        PLANNED: {
          label: "Planifiée",
          variant: "secondary",
          className:
            "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
        },
        DUE_SOON: {
          label: "Bientôt due",
          variant: "default",
          className:
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        },
        OVERDUE: {
          label: "En retard",
          variant: "destructive",
          className:
            "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        },
        COMPLETED: {
          label: "Terminée",
          variant: "outline",
          className:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        },
        CANCELLED: {
          label: "Annulée",
          variant: "outline",
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        },
      };

      const config = statusConfig[status] ?? {
        label: status,
        variant: "default" as const,
        className: "",
      };

      return (
        <div className="flex items-center justify-center">
          <MotionDiv
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <BadgeWithToolTip
              content={`Statut de la tâche: ${config.label}`}
              variant={config.variant}
              className={`text-[11px] font-semibold px-3 py-1 border ${config.className}`}
            >
              {config.label}
            </BadgeWithToolTip>
          </MotionDiv>
        </div>
      );
    },
    enableSorting: true,
  },

  // --- SEVERITY ---
  {
    id: "severity",
    header: () => (
      <TitleComponent
        className="flex items-center justify-center"
        label="Priorité"
      />
    ),
    accessorKey: "severity",
    cell: ({ row }) => {
      const severity = row.original.severity;

      const severityConfig: Record<
        VehicleTaskSeverity,
        { label: string; icon: React.ComponentType<any>; className: string }
      > = {
        info: {
          label: "Info",
          icon: AlertCircle,
          className:
            "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
        },
        warning: {
          label: "Moyenne",
          icon: AlertTriangle,
          className:
            "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
        },
        critical: {
          label: "Critique",
          icon: AlertTriangle,
          className:
            "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
        },
      };

      const config = severityConfig[severity] ?? severityConfig.info;
      const Icon = config.icon;

      return (
        <div className="flex items-center justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${config.className}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },

  // --- NOTIFICATIONS COUNT ---
  // {
  //   id: "notifications",
  //   header: () => (
  //     <TitleComponent className="flex justify-center" label="Notifications" />
  //   ),
  //   accessorKey: "notificationsCount",
  //   cell: ({ row }) => {
  //     const count = row.original.notificationsCount ?? 0;
  //     const last = row.original.lastNotificationAt;

  //     return (
  //       <div className="flex flex-col items-center gap-0.5">
  //         <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 bg-muted/40">
  //           <Bell className="h-3.5 w-3.5 text-muted-foreground/70" />
  //           <span className="text-[11px] font-semibold tabular-nums">
  //             {count}
  //           </span>
  //         </div>
  //         {last && (
  //           <span className="text-[10px] text-muted-foreground tabular-nums">
  //             {format(new Date(last), "P")}
  //           </span>
  //         )}
  //       </div>
  //     );
  //   },
  //   enableSorting: true,
  // },

  // --- CREATED AT ---
  {
    id: "createdAt",
    header: () => (
      <TitleComponent className="flex justify-center" label="Créée le" />
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;

      return (
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/40" />
          <p className="text-xs font-medium text-muted-foreground tabular-nums">
            {createdAt
              ? format(new Date(createdAt), "PP", { locale: fr })
              : "N/A"}
          </p>
        </div>
      );
    },
    enableSorting: true,
  },

  // --- ACTIONS ---
  // {
  //   id: "actions",
  //   header: () => (
  //     <span className="flex justify-end text-xs font-medium text-muted-foreground">
  //       Actions
  //     </span>
  //   ),
  //   cell: ({ row }) => {
  //     return <VehicleTaskActionCell row={row} />;
  //   },
  //   enableSorting: false,
  // },
];
