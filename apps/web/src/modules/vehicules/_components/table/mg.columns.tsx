import type { ColumnDef } from "@tanstack/react-table";
import {
  CarFront,
  User2,
  Shield,
  Flame,
  Wrench,
  Droplets,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { motion } from "framer-motion";
import { MGMaintenanceRow } from "../../types/mg.types";
import TitleComponent from "@/components/shared/table/title.component";
import { MGVehicleActionCell } from "@/components/shared/table/action.component";
import { join, safe, safeDate, safeDaysUntil } from "../../helpers";

const MotionDiv = motion.div;

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: fr });
  } catch {
    return "-";
  }
}

function formatMileage(km?: number | null) {
  if (km == null) return "-";
  return `${km.toLocaleString("fr-FR")} km`;
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function expiryBadgeConfig(days: number | null) {
  if (days == null)
    return { label: "-", cls: "bg-muted text-muted-foreground border-muted" };
  if (days < 0)
    return {
      label: `Expiré (${Math.abs(days)}j)`,
      cls: "bg-red-500/10 text-red-700 border-red-500/20",
    };
  if (days <= 14)
    return {
      label: `Urgent (${days}j)`,
      cls: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    };
  if (days <= 30)
    return {
      label: `Bientôt (${days}j)`,
      cls: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    };
  return {
    label: `Valide (${days}j)`,
    cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  };
}

export const mgVehicleColumns: ColumnDef<MGMaintenanceRow>[] = [
  // SELECT
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    size: 50,
    enableSorting: false,
  },

  // VEHICULE
  {
    id: "plateNumber",
    accessorKey: "plateNumber",
    meta: {
      label: "Véhicule",
      exportValue: (v) =>
        `${join([v.brand, v.model])} (${safe(v.plateNumber)})`,
    },
    header: () => (
      <TitleComponent className="flex justify-start" label="Véhicule" />
    ),
    cell: ({ row }) => {
      const { openModal, setSelectedItem } = useModalStore();
      const v = row.original;
      const label = [v.brand, v.model].filter(Boolean).join(" ") || "-";

      const open = () => {
        setSelectedItem(v);
        // nouveau modal dédié MG (ou réutilise ton détails actuel)
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

          <div className="min-w-0">
            <div
              onClick={open}
              className="text-sm font-medium truncate cursor-pointer hover:underline"
            >
              {label}
            </div>
            <div className="text-[12px] font-mono text-muted-foreground uppercase tracking-tight">
              {v.plateNumber}
            </div>
            <div className="text-[12px] text-muted-foreground/70">
              {[v.type, v.energy, v.fiscalPower ? `${v.fiscalPower} CV` : null]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // AFFECTÉ À
  {
    id: "assignedToName",
    accessorKey: "assignedToName",
    meta: {
      label: "Utilisateur",
      exportValue: (v) =>
        v.assignedToName
          ? `${v.assignedToName}${v.assignedToDirection ? ` (${v.assignedToDirection})` : ""}`
          : "Non affecté",
    },
    header: () => (
      <TitleComponent className="flex justify-start" label="Utilisateur" />
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

  // ASSURANCE
  {
    id: "insurance",
    accessorFn: (row) => row.insuranceExpiresAt ?? "",
    meta: {
      label: "Assurance",
      exportValue: (v) =>
        `${safe(v.insuranceProvider)} - ${safeDaysUntil(v.insuranceExpiresAt)}`,
    },
    header: () => (
      <TitleComponent className="flex justify-center" label="Assurance" />
    ),
    cell: ({ row }) => {
      const v = row.original;
      const days = daysUntil(v.insuranceExpiresAt);
      const cfg = expiryBadgeConfig(days);

      // console.log("Insurance", row.original.insuranceProvider);

      return (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">
              {v.insuranceProvider ?? "-"}
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] px-2 py-0.5 border w-full rounded-lg flex justify-center",
              cfg.cls,
            )}
          >
            {cfg.label}
          </Badge>

          <div className="flex flex-col space-y-px">
            <div className="text-[11px] text-muted-foreground">
              Délivrée:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.insuranceIssuedAt)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Expire:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.insuranceExpiresAt)}
              </span>
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },

  // EXTINCTEUR
  {
    id: "extinguisher",
    meta: {
      label: "Extincteur",
      exportValue: (v) => safeDaysUntil(v.extinguisherExpiresAt),
    },
    accessorFn: (row) => row.extinguisherExpiresAt ?? "",
    header: () => (
      <TitleComponent className="flex justify-center" label="Extincteur" />
    ),
    cell: ({ row }) => {
      const v = row.original;
      const days = daysUntil(v.extinguisherExpiresAt);
      const cfg = expiryBadgeConfig(days);

      return (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">
              Carte extincteur
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] px-2 flex justify-center w-full py-0.5 border rounded-lg",
              cfg.cls,
            )}
          >
            {cfg.label}
          </Badge>
          {/* <span className="text-[11px] text-muted-foreground tabular-nums">
          </span> */}
          <div className="flex flex-col space-y-px">
            <div className="text-[11px] text-muted-foreground">
              Délivrée:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.extinguisherIssuedAt)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Expire:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.extinguisherExpiresAt)}
              </span>
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },

  // VISITE TECHNIQUE (DOC)
  {
    id: "techInspection",
    accessorFn: (row) => row.techInspectionExpiresAt ?? "",
    meta: {
      label: "Visite tech.",
      exportValue: (v) => safeDaysUntil(v.techInspectionExpiresAt),
    },
    header: () => (
      <TitleComponent className="flex justify-center" label="Visite tech." />
    ),
    cell: ({ row }) => {
      const v = row.original;

      const days = daysUntil(v.techInspectionExpiresAt);
      const cfg = expiryBadgeConfig(days);

      return (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">Validité</span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[11px] px-2 py-0.5 border rounded-lg flex justify-center w-full",
              cfg.cls,
            )}
          >
            {cfg.label}
          </Badge>

          <div className="flex flex-col space-y-px">
            <div className="text-[11px] text-muted-foreground">
              Délivrée:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.techInspectionIssuedAt)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Expire:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.techInspectionExpiresAt)}
              </span>
            </div>
          </div>

          {/* {v.techInspectionReference && (
          <span className="text-[10px] text-muted-foreground/70">
            Ref: {v.techInspectionReference}
          </span>
        )} */}
        </div>
      );
    },
    enableSorting: true,
  },
  // CARTE PARKING (DOC)
  {
    id: "parkingCard",
    accessorFn: (row) => row.parkingCardExpiresAt ?? "",
    meta: {
      label: "Carte parking",
      exportValue: (v) => safeDaysUntil(v.parkingCardExpiresAt),
    },
    header: () => (
      <TitleComponent className="flex justify-center" label="Carte parking" />
    ),
    cell: ({ row }) => {
      const v = row.original;

      const days = daysUntil(v.parkingCardExpiresAt);
      const cfg = expiryBadgeConfig(days);

      return (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">Carte parking</span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[11px] px-2 py-0.5 border rounded-lg flex justify-center w-full",
              cfg.cls,
            )}
          >
            {cfg.label}
          </Badge>

          {/* <span className="text-[11px] text-muted-foreground tabular-nums">
            {formatDate(v.parkingCardExpiresAt)}
          </span> */}
          <div className="flex flex-col space-y-px">
            <div className="text-[11px] text-muted-foreground">
              Délivrée:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.parkingCardIssuedAt)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Expire:{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {formatDate(v.parkingCardExpiresAt)}
              </span>
            </div>
          </div>

          {/* {v.parkingCardReference && (
          <span className="text-[10px] text-muted-foreground/70">
            Ref: {v.parkingCardReference}
          </span>
        )} */}
        </div>
      );
    },
    enableSorting: true,
  },

  // VIDANGE
  {
    id: "oil",
    accessorFn: (row) => row.nextOilChangeKm ?? 0,
    meta: {
      label: "Vidange",
      exportValue: (v) =>
        `Dernière: ${safe(v.lastOilChangeKm)} km | Prochaine: ${safe(v.nextOilChangeKm)} km`,
    },
    header: () => (
      <TitleComponent className="flex justify-center" label="Vidange" />
    ),
    cell: ({ row }) => {
      const v = row.original;
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">
              Cadence:{" "}
              {v.oilChangeEveryKm ? formatMileage(v.oilChangeEveryKm) : "-"}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Dernière:{" "}
            <span className="font-medium text-foreground/80">
              {formatMileage(v.lastOilChangeKm)}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Prochaine:{" "}
            <span className="font-medium text-foreground/80">
              {formatMileage(v.nextOilChangeKm)}
            </span>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },

  // CHECKING
  {
    id: "checking",
    accessorFn: (row) => row.lastCheckingKm ?? 0,
    meta: {
      label: "Checking",
      exportValue: (v) =>
        safe(v.lastCheckingKm) !== "-" ? `${v.lastCheckingKm} km` : "-",
    },
    header: () => (
      <TitleComponent className="flex justify-center" label="Checking" />
    ),
    cell: ({ row }) => {
      const v = row.original;
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">Dernier</span>
          </div>
          <span className="text-sm font-medium">
            {formatMileage(v.lastCheckingKm)}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },

  // NOTES
  {
    id: "maintenanceNotes",
    accessorKey: "maintenanceNotes",
    meta: {
      label: "Notes",
      exportValue: (v) => safe(v.maintenanceNotes)?.replace(/\r?\n|\r/g, " "),
    },
    header: () => (
      <TitleComponent className="flex justify-start" label="Notes" />
    ),
    cell: ({ row }) => {
      const v = row.original;
      return (
        <div className="max-w-[380px] text-xs text-muted-foreground line-clamp-3">
          {v.maintenanceNotes || "-"}
        </div>
      );
    },
    enableSorting: false,
  },

  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: () => (
      <TitleComponent className="flex justify-start" label="Date d’ajout" />
    ),
    cell: ({ row }) => {
      const v = row.original;
      return (
        <span className="text-sm text-muted-foreground flex justify-center tabular-nums">
          {formatDate(v.createdAt)}
        </span>
      );
    },
    meta: {
      label: "Ajouté le",
      filterVariant: "date-range",
      exportValue: (v) => safeDate(v.createdAt),
    },
    filterFn: (row, _id, value) => {
      const [from, to] = value ?? [];
      const d = new Date(row.getValue(_id));
      if (from && d < new Date(from)) return false;
      if (to && d > new Date(to)) return false;
      return true;
    },
  },

  {
    id: "actions",
    header: () => (
      <span className="flex justify-end text-xs font-medium text-muted-foreground">
        Actions
      </span>
    ),
    enableHiding: false,
    cell: ({ row }) => <MGVehicleActionCell row={row} />,
  },
];
