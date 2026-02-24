// asset.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { Checkbox } from "@/components/ui/checkbox";
import { AssetDTO, AssetSituation } from "../../types/asset-type";
import TitleComponent from "@/components/shared/table/title.component";
import { BadgeWithToolTip } from "@/components/shared/badge-tooltip";
import { Calendar, MapPin, Package, Tag } from "lucide-react";
import { AssetActionCell } from "@/components/shared/table/action.component";
import { fr } from "date-fns/locale";

const MotionDiv = motion.div;

// Optional, if/when you create it:
// import { AssetActionCell } from "./asset-action-cell";

export const columns: ColumnDef<AssetDTO>[] = [
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
    sortUndefined: "last",
    sortDescFirst: false,
    size: 50,
  },

  // --- ASSET IDENTITY (CODE + LABEL) ---
  {
    id: "label",
    header: () => (
      <TitleComponent className="flex justify-start" label="Biens" />
    ),
    accessorKey: "label",
    cell: ({ row }) => {
      const { code, label } = row.original;

      return (
        <MotionDiv
          className="flex items-center gap-3 py-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-xs font-bold tracking-tight text-foreground/90">
              {code}
            </span>
            <span className="text-sm font-medium text-muted-foreground truncate">
              {label || "N/A"}
            </span>
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- CATEGORY ---
  {
    id: "categoryId",
    header: () => <TitleComponent label="Catégorie" />,
    accessorKey: "category.label",
    cell: ({ row }) => {
      const category = row.original.categoryId;
      const rawFamily = category?.family;
      const family =
        rawFamily === "EQUIPEMENT"
          ? "Équipement"
          : rawFamily === "INFORMATIQUE"
            ? "Informatique"
            : rawFamily === "MOBILIER"
              ? "Mobilier"
              : "N/A";

      const familyColors = {
        Équipement: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        Informatique: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
        Mobilier: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        "N/A": "bg-gray-500/10 text-gray-700 dark:text-gray-400",
      };

      return (
        <MotionDiv
          className="flex flex-col gap-1.5"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {/* <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-sm font-medium truncate">
              {category?.label ?? "N/A"}
            </span>
          </div> */}
          <span
            className={`text-[10px] font-semibold flex gap-1 uppercase tracking-wider px-2 py-1.5 rounded-md w-fit ${familyColors[family as keyof typeof familyColors]}`}
          >
            <Tag className="h-3.5 w-3.5 text-muted-foreground/60" />
            {family}
          </span>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- LOCATION ---
  {
    id: "locationId.code",
    header: () => <TitleComponent label="Emplacement" />,
    accessorKey: "locationId.code",
    cell: ({ row }) => {
      const loc = row.original.locationId;
      const office = row.original.locationId.bureau;
      // const path = loc?.path;
      const code = loc?.code;

      return (
        <MotionDiv
          className="flex items-start gap-2 max-w-[280px]"
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-0">
            {code && (
              <span className="text-[10px] font-mono font-semibold text-muted-foreground/70 uppercase tracking-wider">
                {code}
              </span>
            )}
            <span className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
              {/* {path ?? "No location assigned"} */}
              {office || "N/A"}
            </span>
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- SITUATION / STATUS ---
  {
    id: "situation",
    header: () => (
      <TitleComponent
        className="flex items-center justify-center"
        label="Statut"
      />
    ),
    accessorKey: "situation",
    cell: ({ row }) => {
      const situation = row.original.situation;

      const statusConfig: Record<
        AssetSituation,
        {
          label: string;
          variant: "default" | "secondary" | "destructive" | "outline";
          className: string;
        }
      > = {
        NEUF: {
          label: "Neuf",
          variant: "secondary",
          className:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        },
        EN_SERVICE: {
          label: "En service",
          variant: "default",
          className:
            "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        },
        EN_PANNE: {
          label: "En panne",
          variant: "destructive",
          className:
            "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        },
        HORS_SERVICE: {
          label: "Hors service",
          variant: "outline",
          className:
            "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        },
        REFORME: {
          label: "Réformé",
          variant: "outline",
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        },
      };

      const config = statusConfig[situation] ?? {
        label: situation,
        variant: "default",
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
              content={`Statut actuel : ${config.label}`}
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

  // --- BRAND / MODEL ---
  // {
  //   id: "brandModel",
  //   header: () => <TitleComponent label="Brand / Model" />,
  //   cell: ({ row }) => {
  //     const { brand, model } = row.original;
  //     const hasBrandOrModel = brand || model;

  //     if (!hasBrandOrModel) {
  //       return (
  //         <span className="text-xs text-muted-foreground italic">N/A</span>
  //       );
  //     }

  //     return (
  //       <div className="flex flex-col gap-0.5 max-w-[180px]">
  //         {brand && (
  //           <span className="text-sm font-medium line-clamp-1">{brand}</span>
  //         )}
  //         {model && (
  //           <span className="text-xs text-muted-foreground line-clamp-1">
  //             {model}
  //           </span>
  //         )}
  //       </div>
  //     );
  //   },
  //   enableSorting: false,
  // },

  // // --- SERIAL NUMBER ---
  // {
  //   id: "serialNumber",
  //   header: () => <TitleComponent label="Serial" />,
  //   accessorKey: "serialNumber",
  //   cell: ({ row }) => {
  //     const serial = row.original.serialNumber;
  //     return (
  //       <span className="text-xs font-mono line-clamp-1 max-w-[140px]">
  //         {serial || "N/A"}
  //       </span>
  //     );
  //   },
  //   enableSorting: false,
  // },

  // --- QUANTITY / UNIT ---
  // {
  //   id: "quantity",
  //   header: () => (
  //     <TitleComponent className="flex justify-center" label="Qté" />
  //   ),
  //   accessorKey: "quantity",
  //   cell: ({ row }) => {
  //     const qty = row.original.quantity ?? 0;
  //     const unit = row.original.unit ?? "pcs";

  //     return (
  //       <div className="flex justify-center">
  //         <MotionDiv
  //           className="flex items-baseline gap-1 px-3 py-1.5 rounded-md bg-muted/30"
  //           whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
  //           transition={{ type: "spring", stiffness: 400, damping: 17 }}
  //         >
  //           <span className="text-base font-bold tabular-nums text-foreground">
  //             {qty}
  //           </span>
  //           <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
  //             {unit}
  //           </span>
  //         </MotionDiv>
  //       </div>
  //     );
  //   },
  //   enableSorting: true,
  // },

  // --- CREATED AT ---
  {
    id: "createdAt",
    header: () => (
      <TitleComponent className="flex justify-center" label="Ajouté le" />
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;

      return (
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/40" />
          <p className="text-xs font-medium text-muted-foreground tabular-nums">
            {createdAt ? format(new Date(createdAt), "PP", { locale: fr }) : "N/A"}
          </p>
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
    cell: ({ row }) => {
      return <AssetActionCell row={row} />;
    },
    enableSorting: false,
  },
];
