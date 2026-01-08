// src/features/vehicles/components/vehicle-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { CarFront, Gauge, User2, Building2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import TitleComponent from "@/components/shared/table/title.component";
import { BadgeWithToolTip } from "@/components/shared/badge-tooltip";

import type { Vehicle } from "../../types/vehicle.types";
import { VehicleActionCell } from "@/components/shared/table/action.component";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";

const MotionDiv = motion.div;

function formatMileage(km: number | undefined | null) {
  if (km == null) return "-";
  return `${km.toLocaleString("fr-FR")} km`;
}

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: fr });
  } catch {
    return "";
  }
}

function getStatusConfig(status: Vehicle["status"]): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Actif",
        variant: "default",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      };
    case "IN_MAINTENANCE":
      return {
        label: "En maintenance",
        variant: "secondary",
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      };
    case "INACTIVE":
      return {
        label: "Inactif",
        variant: "outline",
        className:
          "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
      };
    case "RETIRED":
      return {
        label: "Retiré",
        variant: "outline",
        className:
          "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
      };
    default:
      return {
        label: status,
        variant: "outline",
        className: "",
      };
  }
}

export const vehicleColumns: ColumnDef<Vehicle>[] = [
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

  // --- VÉHICULE (carte complète : marque/modèle + plaque) ---
  {
    id: "plateNumber",
    accessorKey: "plateNumber", // utile pour tri/filtre
    header: () => (
      <TitleComponent className="flex justify-start" label="Véhicule" />
    ),
    cell: ({ row }) => {
      const { openModal, setSelectedItem } = useModalStore();
      const v = row.original;
      const plate = v.plateNumber || "(plaque inconnue)";
      const fullLabel = [v.brand, v.model].filter(Boolean).join(" ") || "-";

      const handleOpenDetails = () => {
        setSelectedItem(v);
        openModal(ModalTypes.VEHICLE_DETAILS, v);
      };

      return (
        <MotionDiv
          className="flex items-center gap-3 py-1"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
            <CarFront className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              onClick={handleOpenDetails}
              className="text-sm font-medium text-foreground/90 truncate cursor-pointer hover:underline"
            >
              {fullLabel}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/80 uppercase tracking-tight">
              {plate}
            </span>
            {(v.type || v.year) && (
              <span className="text-[10px] text-muted-foreground/70">
                {[v.type, v.year].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- STATUT ---
  {
    id: "status",
    accessorKey: "status",
    header: () => (
      <TitleComponent
        className="flex items-center justify-center"
        label="Statut"
      />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const config = getStatusConfig(status);

      return (
        <div className="flex items-center justify-center">
          <BadgeWithToolTip
            content={`Statut du véhicule: ${config.label}`}
            variant={config.variant}
            className={`text-[11px] font-semibold px-3 py-1 border ${config.className}`}
          >
            {config.label}
          </BadgeWithToolTip>
        </div>
      );
    },
    enableSorting: true,
  },

  // --- AFFECTATION ---
  {
    id: "assignedToName",
    accessorKey: "assignedToName",
    header: () => (
      <TitleComponent className="flex justify-start" label="Affecté à" />
    ),
    cell: ({ row }) => {
      const v = row.original;

      if (!v.assignedToName && !v.assignedToDirection) {
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User2 className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span>Non affecté</span>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-0.5">
          {v.assignedToName && (
            <div className="inline-flex items-center gap-1.5">
              <User2 className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="text-sm font-medium">{v.assignedToName}</span>
            </div>
          )}
          {v.assignedToDirection && (
            <div className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">
                {v.assignedToDirection}
              </span>
            </div>
          )}
        </div>
      );
    },
    enableSorting: true,
  },

  // --- KILOMÉTRAGE ---
  {
    id: "currentMileage",
    accessorKey: "currentMileage",
    header: () => (
      <TitleComponent className="flex justify-center" label="Kilométrage" />
    ),
    cell: ({ row }) => {
      const v = row.original;

      return (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-sm font-medium">
              {formatMileage(v.currentMileage)}
            </span>
          </div>
          {v.mileageUpdatedAt && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              Maj le {formatDate(v.mileageUpdatedAt)}
            </span>
          )}
        </div>
      );
    },
    enableSorting: true,
  },

  // --- ACTIONS ---
  {
    id: "actions",
    header: () => (
      <span className="flex justify-end text-xs font-medium text-muted-foreground">
        Actions
      </span>
    ),
    enableHiding: false,
    cell: ({ row }) => {
      return <VehicleActionCell row={row} />;
    },
  },
];
