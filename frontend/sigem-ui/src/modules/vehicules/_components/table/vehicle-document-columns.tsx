// src/modules/vehicules/_components/vehicle-document-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  Bell,
  CarFront,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import TitleComponent from "@/components/shared/table/title.component";
import { BadgeWithToolTip } from "@/components/shared/badge-tooltip";
import { Badge } from "@/components/ui/badge";
import { VehicleDocument } from "../../types/vehicle-document.types";
import { VehicleDocumentActionCell } from "@/components/shared/table/action.component";

const MotionDiv = motion.div;
const EXPIRY_SOON_DAYS = 30;

// Si ton type backend enrichit avec véhicule, adapte ici
export type VehicleDocumentRow = VehicleDocument & {
  vehiclePlate?: string;
  vehicleLabel?: string;
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "P", { locale: fr });
  } catch {
    return "";
  }
}

function getDocumentTypeLabel(type: VehicleDocument["type"]) {
  switch (type) {
    case "INSURANCE":
      return "Assurance";
    case "TECH_INSPECTION":
      return "Visite technique";
    case "PARKING_CARD":
      return "Carte parking";
    case "EXTINGUISHER_CARD":
      return "Carte extincteur";
    case "REGISTRATION":
      return "Carte grise";
    case "TAX_STICKER":
      return "Vignette / taxe";
    case "OTHER":
      return "Autre document";
    default:
      return type;
  }
}

function computeExpiryStatus(expiresAt?: string | null) {
  if (!expiresAt) {
    return {
      status: "unknown" as const,
      label: "Date inconnue",
      daysDiff: null as number | null,
    };
  }

  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (Number.isNaN(diffDays)) {
    return {
      status: "unknown" as const,
      label: "Date invalide",
      daysDiff: null,
    };
  }

  if (diffDays < 0) {
    return {
      status: "expired" as const,
      label: `Expiré(e) depuis ${Math.abs(Math.round(diffDays))} j`,
      daysDiff: Math.round(diffDays),
    };
  }

  if (diffDays <= EXPIRY_SOON_DAYS) {
    return {
      status: "soon" as const,
      label: `Échéance dans ${Math.round(diffDays)} j`,
      daysDiff: Math.round(diffDays),
    };
  }

  return {
    status: "valid" as const,
    label: `Valide ~ ${Math.round(diffDays)} j restants`,
    daysDiff: Math.round(diffDays),
  };
}

export const vehicleDocumentColumns: ColumnDef<VehicleDocumentRow>[] = [
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

  // --- VEHICLE ---
  {
    id: "vehicleId.model",
    header: () => (
      <TitleComponent className="flex justify-start" label="Véhicule" />
    ),
    accessorKey: "vehicleId.model",
    cell: ({ row }) => {
      const { model, brand, plateNumber } = row.original.vehicleId;

      const vehicleLabel = `${brand} ${model}`;
      const displayLabel = vehicleLabel || "Véhicule non renseigné";
      const displayPlate = plateNumber || "(plaque inconnue)";

      return (
        <MotionDiv
          className="flex items-center gap-3 py-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
            <CarFront className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-foreground/90 truncate">
              {displayLabel}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/80 uppercase tracking-tight">
              {displayPlate}
            </span>
            {/* {id && (
              <span className="text-[10px] text-muted-foreground/60">
                ID: {id}
              </span>
            )} */}
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- DOCUMENT (TYPE + RÉF) ---
  {
    id: "document",
    header: () => (
      <TitleComponent className="flex justify-start" label="Document" />
    ),
    accessorKey: "type",
    cell: ({ row }) => {
      const { type, reference } = row.original;

      const typeLabel = getDocumentTypeLabel(type);
      return (
        <div className="flex items-start gap-3 min-w-0 max-w-[260px]">
          <div className="mt-0.5 flex border h-8 w-8 items-center justify-center rounded-md bg-black/10">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-foreground line-clamp-1">
              {typeLabel}
            </span>
            {reference && (
              <span className="text-[11px] text-muted-foreground/80 line-clamp-1">
                Réf: {reference}
              </span>
            )}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },

  // --- VALIDITÉ (DATE + JOURS RESTANTS) ---
  {
    id: "validity",
    header: () => (
      <TitleComponent className="flex justify-center" label="Validité" />
    ),
    accessorKey: "expiresAt",
    cell: ({ row }) => {
      const { issuedAt, expiresAt } = row.original;

      const exp = computeExpiryStatus(expiresAt);
      const expDate = formatDate(expiresAt);
      const issuedDate = formatDate(issuedAt);

      return (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs font-medium tabular-nums text-foreground/80">
              {expDate || "N/A"}
            </span>
          </div>
          {issuedDate && (
            <span className="text-[10px] text-muted-foreground">
              Émis le {issuedDate}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground/80">
            {exp.label}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },

  // --- STATUT (EXPIRE / BIENTÔT / VALIDE) ---
  {
    id: "status",
    header: () => (
      <TitleComponent className="flex justify-center" label="Statut" />
    ),
    accessorFn: (row) => row.expiresAt,
    cell: ({ row }) => {
      const { expiresAt } = row.original;
      const exp = computeExpiryStatus(expiresAt);

      let icon = AlertCircle;
      let className = "";
      let label = "";

      if (exp.status === "expired") {
        icon = AlertTriangle;
        label = "Expiré";
        className =
          "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30";
      } else if (exp.status === "soon") {
        icon = AlertTriangle;
        label = "Bientôt à échéance";
        className =
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
      } else if (exp.status === "valid") {
        icon = CheckCircle2;
        label = "Valide";
        className =
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      } else {
        icon = AlertCircle;
        label = "Inconnu";
        className =
          "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30";
      }

      const Icon = icon;

      return (
        <div className="flex items-center justify-center">
          <BadgeWithToolTip
            content={exp.label}
            variant="outline"
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold border ${className}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </BadgeWithToolTip>
        </div>
      );
    },
    enableSorting: true,
  },

  // --- RAPPELS ---
  {
    id: "reminders",
    header: () => (
      <TitleComponent
        className="flex justify-center"
        label="Rappels (jours avant)"
      />
    ),
    accessorKey: "reminderDaysBefore",
    cell: ({ row }) => {
      const reminders = row.original.reminderDaysBefore ?? [];
      const label =
        reminders.length > 0
          ? reminders.sort((a, b) => a - b).join(" · ")
          : "Par défaut";

      return (
        <div className="flex flex-col items-center gap-0.5">
          <Badge variant="outline" className="text-[11px] px-2 py-0.5">
            {label}
          </Badge>
          {reminders.length === 0 && (
            <span className="text-[10px] text-muted-foreground">
              30, 15, 7 jours
            </span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },

  // --- NOTIFICATIONS ---
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
  //             {formatDate(last)}
  //           </span>
  //         )}
  //       </div>
  //     );
  //   },
  //   enableSorting: true,
  // },

  // --- ACTIONS ---
  {
    id: "actions",
    header: () => (
      <span className="flex justify-end text-xs font-medium text-muted-foreground">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      return <VehicleDocumentActionCell row={row} />;
    },
    enableSorting: false,
  },
];
