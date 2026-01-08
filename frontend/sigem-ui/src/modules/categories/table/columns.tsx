// category.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { Checkbox } from "@/components/ui/checkbox";
import TitleComponent from "@/components/shared/table/title.component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderTree,
  Layers,
  Hash,
  FileText,
  Calendar,
  MoreVertical,
  Laptop,
  Wrench,
  Armchair,
} from "lucide-react";
import { CategoryDTO, FamilyType } from "@/modules/assets/types/asset-type";
import { CategoryActionCell } from "@/components/shared/table/action.component";

const MotionDiv = motion.div;

// Family icon and color mapping
const familyConfig: Record<
  FamilyType,
  {
    icon: React.ElementType;
    label: string;
    gradient: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  EQUIPEMENT: {
    icon: Wrench,
    label: "Équipement",
    gradient: "from-blue-500/20 to-blue-600/10",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-500/20",
  },
  INFORMATIQUE: {
    icon: Laptop,
    label: "Informatique",
    gradient: "from-purple-500/20 to-purple-600/10",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-700 dark:text-purple-400",
    borderClass: "border-purple-500/20",
  },
  MOBILIER: {
    icon: Armchair,
    label: "Mobilier",
    gradient: "from-amber-500/20 to-amber-600/10",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-500/20",
  },
};

export const columns: ColumnDef<CategoryDTO>[] = [
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

  // --- CATEGORY IDENTITY (CODE + LABEL) ---
  {
    id: "identity",
    header: () => (
      <TitleComponent className="flex justify-start" label="Category" />
    ),
    accessorKey: "code",
    cell: ({ row }) => {
      const { code, label } = row.original;

      return (
        <MotionDiv
          className="flex items-center gap-3 py-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <FolderTree className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {label}
            </span>
            <span className="font-mono text-[10px] font-bold tracking-tight text-muted-foreground/70 uppercase">
              {code}
            </span>
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- FAMILY ---
  {
    id: "family",
    header: () => <TitleComponent label="Family" />,
    accessorKey: "family",
    cell: ({ row }) => {
      const family = row.original.family;
      const config = familyConfig[family];
      const FamilyIcon = config.icon;

      return (
        <MotionDiv
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} border ${config.borderClass}`}
          >
            <FamilyIcon className={`h-4 w-4 ${config.textClass}`} />
          </div>
          <span className={`text-sm font-semibold ${config.textClass}`}>
            {config.label}
          </span>
        </MotionDiv>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  // --- CANONICAL PREFIX ---
  {
    id: "canonicalPrefix",
    header: () => <TitleComponent label="Prefix" />,
    accessorKey: "canonicalPrefix",
    cell: ({ row }) => {
      const prefix = row.original.canonicalPrefix;

      return (
        <MotionDiv
          className="flex items-center gap-2"
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Hash className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-mono text-xs font-bold tracking-tight text-foreground/80 px-2 py-1 rounded bg-muted/50">
            {prefix}
          </span>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- HIERARCHY (PARENT) ---
  {
    id: "hierarchy",
    header: () => <TitleComponent label="Hierarchy" />,
    accessorKey: "parentId",
    cell: ({ row }) => {
      const parentId = row.original.parentId;
      const hasParent = !!parentId;

      return (
        <MotionDiv
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Layers
            className={`h-3.5 w-3.5 ${hasParent ? "text-primary/70" : "text-muted-foreground/40"}`}
          />
          <div className="flex flex-col gap-0.5">
            {hasParent ? (
              <>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold px-2 py-0.5 bg-primary/5 border-primary/20"
                >
                  Sub-category
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Parent: {parentId}
                </span>
              </>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold px-2 py-0.5 bg-muted/30 border-muted-foreground/20"
              >
                Root Level
              </Badge>
            )}
          </div>
        </MotionDiv>
      );
    },
    enableSorting: false,
  },

  // --- DESCRIPTION ---
  // {
  //   id: "description",
  //   header: () => <TitleComponent label="Description" />,
  //   accessorKey: "description",
  //   cell: ({ row }) => {
  //     const description = row.original.description;

  //     return (
  //       <MotionDiv
  //         className="flex items-start gap-2 max-w-[300px]"
  //         whileHover={{ x: 2 }}
  //         transition={{ type: "spring", stiffness: 400, damping: 17 }}
  //       >
  //         <FileText className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
  //         <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
  //           {description || (
  //             <span className="italic text-muted-foreground/60">
  //               No description
  //             </span>
  //           )}
  //         </p>
  //       </MotionDiv>
  //     );
  //   },
  //   enableSorting: false,
  // },

  // --- ALLOWED CHILDREN COUNT ---
  // {
  //   id: "allowedChildren",
  //   header: () => (
  //     <TitleComponent className="flex justify-center" label="Children" />
  //   ),
  //   accessorKey: "allowedChildren",
  //   cell: ({ row }) => {
  //     const allowedChildren = row.original.allowedChildren;
  //     const count = allowedChildren?.length ?? 0;

  //     return (
  //       <div className="flex items-center justify-center">
  //         <MotionDiv
  //           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
  //             count > 0
  //               ? "bg-primary/5 border border-primary/20"
  //               : "bg-muted/30 border border-muted"
  //           }`}
  //           whileHover={{ scale: 1.05 }}
  //           transition={{ type: "spring", stiffness: 400, damping: 17 }}
  //         >
  //           <Layers
  //             className={`h-3.5 w-3.5 ${
  //               count > 0 ? "text-primary" : "text-muted-foreground/60"
  //             }`}
  //           />
  //           <span
  //             className={`text-sm font-bold tabular-nums ${
  //               count > 0 ? "text-primary" : "text-muted-foreground"
  //             }`}
  //           >
  //             {count}
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
      <TitleComponent className="flex justify-end" label="Created" />
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;

      return (
        <div className="flex items-center justify-end gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/40" />
          <p className="text-xs font-medium text-muted-foreground tabular-nums">
            {createdAt ? format(new Date(createdAt), "PP") : "N/A"}
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
      return <CategoryActionCell row={row} />;
    },
    enableSorting: false,
  },
];
