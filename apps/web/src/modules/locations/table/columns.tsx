// location.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { Checkbox } from "@/components/ui/checkbox";
import TitleComponent from "@/components/shared/table/title.component";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Compass,
  Briefcase,
  DoorOpen,
  Calendar,
} from "lucide-react";
import { LevelType, LocationDTO } from "@/modules/assets/types/asset-type";
import { LocationActionCell } from "@/components/shared/table/action.component";
import { fr } from "date-fns/locale";

const MotionDiv = motion.div;

// Level configuration with icons and colors
const levelConfig: Record<
  LevelType,
  {
    icon: React.ElementType;
    label: string;
    gradient: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    order: number;
  }
> = {
  LOCALISATION: {
    icon: Compass,
    label: "Localisation",
    gradient: "from-blue-500/20 to-cyan-500/10",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-500/20",
    order: 1,
  },
  BATIMENT: {
    icon: Building2,
    label: "Bâtiment",
    gradient: "from-purple-500/20 to-indigo-500/10",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-700 dark:text-purple-400",
    borderClass: "border-purple-500/20",
    order: 2,
  },
  DIRECTION: {
    icon: Briefcase,
    label: "Direction",
    gradient: "from-amber-500/20 to-orange-500/10",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-500/20",
    order: 3,
  },
  BUREAU: {
    icon: DoorOpen,
    label: "Bureau",
    gradient: "from-emerald-500/20 to-green-500/10",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-500/20",
    order: 4,
  },
};

export const columns: ColumnDef<LocationDTO>[] = [
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

  // --- LOCATION CODE ---
  {
    id: "code",
    header: () => (
      <TitleComponent className="flex justify-start" label="Code emplacement" />
    ),
    accessorKey: "code",
    cell: ({ row }) => {
      const { code, level } = row.original;
      const config = levelConfig[level];
      const LevelIcon = config.icon;

      return (
        <MotionDiv
          className="flex items-center gap-3 py-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} border ${config.borderClass}`}
          >
            <LevelIcon className={`h-4 w-4 ${config.textClass}`} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-xs font-bold tracking-tight text-foreground">
              {code}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold px-2 py-0.5 w-fit ${config.bgClass} ${config.textClass} ${config.borderClass}`}
            >
              {config.label}
            </Badge>
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- PATH (BREADCRUMB STYLE) ---
  // {
  //   id: "path",
  //   header: () => <TitleComponent label="Location Path" />,
  //   accessorKey: "path",
  //   cell: ({ row }) => {
  //     const { path } = row.original;
  //     const segments = path ? path.split("/").filter(Boolean) : [];

  //     return (
  //       <MotionDiv
  //         className="flex items-center gap-1 max-w-[400px] overflow-hidden"
  //         whileHover={{ x: 2 }}
  //         transition={{ type: "spring", stiffness: 400, damping: 17 }}
  //       >
  //         <Navigation className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
  //         <div className="flex items-center gap-1 overflow-hidden">
  //           {segments.length > 0 ? (
  //             segments.map((segment, index) => (
  //               <div key={index} className="flex items-center gap-1">
  //                 <span
  //                   className={`text-xs truncate ${
  //                     index === segments.length - 1
  //                       ? "font-semibold text-foreground"
  //                       : "text-muted-foreground"
  //                   }`}
  //                 >
  //                   {segment}
  //                 </span>
  //                 {index < segments.length - 1 && (
  //                   <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
  //                 )}
  //               </div>
  //             ))
  //           ) : (
  //             <span className="text-xs text-muted-foreground italic">
  //               No path
  //             </span>
  //           )}
  //         </div>
  //       </MotionDiv>
  //     );
  //   },
  //   enableSorting: true,
  // },

  // --- LOCALISATION ---
  {
    id: "localisation",
    header: () => <TitleComponent label="Site" />,
    accessorKey: "localisation",
    cell: ({ row }) => {
      const localisation = row.original.localisation;
      const config = levelConfig.LOCALISATION;

      return (
        <MotionDiv
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${config.bgClass} border ${config.borderClass}`}
          >
            <Compass className={`h-3.5 w-3.5 ${config.textClass}`} />
          </div>
          <span className="text-sm font-medium text-foreground/90">
            {localisation || (
              <span className="text-muted-foreground italic">N/A</span>
            )}
          </span>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- BATIMENT ---
  {
    id: "batiment",
    header: () => (
      <TitleComponent className="flex justify-center" label="Bâtiment" />
    ),
    accessorKey: "batiment",
    cell: ({ row }) => {
      const batiment = row.original.batiment;
      const config = levelConfig.BATIMENT;

      return (
        <MotionDiv
          className="flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${config.bgClass} border ${config.borderClass}`}
          >
            <Building2 className={`h-3.5 w-3.5 ${config.textClass}`} />
          </div>
          <span className="text-sm font-medium text-foreground/90">
            {batiment || (
              <span className="text-muted-foreground italic">N/A</span>
            )}
          </span>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- DIRECTION ---
  {
    id: "direction",
    header: () => (
      <TitleComponent
        className="flex items-center justify-center"
        label="Direction"
      />
    ),
    accessorKey: "direction",
    cell: ({ row }) => {
      const direction = row.original.direction;
      const config = levelConfig.DIRECTION;

      return (
        <MotionDiv
          className="flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${config.bgClass} border ${config.borderClass}`}
          >
            <Briefcase className={`h-3.5 w-3.5 ${config.textClass}`} />
          </div>
          <span className="text-sm font-medium text-foreground/90">
            {direction || (
              <span className="text-muted-foreground italic">N/A</span>
            )}
          </span>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- BUREAU ---
  {
    id: "bureau",
    header: () => <TitleComponent label="Bureau" />,
    accessorKey: "bureau",
    cell: ({ row }) => {
      const bureau = row.original.bureau;
      const config = levelConfig.BUREAU;

      return (
        <MotionDiv
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${config.bgClass} border ${config.borderClass}`}
          >
            <DoorOpen className={`h-3.5 w-3.5 ${config.textClass}`} />
          </div>
          <span className="text-sm font-medium text-foreground/90">
            {bureau || (
              <span className="text-muted-foreground italic">N/A</span>
            )}
          </span>
        </MotionDiv>
      );
    },
    enableSorting: true,
  },

  // --- LEVEL (HIERARCHY) ---
  // {
  //   id: "level",
  //   header: () => (
  //     <TitleComponent className="flex justify-center" label="Level" />
  //   ),
  //   accessorKey: "level",
  //   cell: ({ row }) => {
  //     const level = row.original.level;
  //     const config = levelConfig[level];
  //     const LevelIcon = config.icon;

  //     return (
  //       <div className="flex items-center justify-center">
  //         <MotionDiv
  //           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br ${config.gradient} border ${config.borderClass}`}
  //           whileHover={{ scale: 1.05 }}
  //           transition={{ type: "spring", stiffness: 400, damping: 17 }}
  //         >
  //           <LevelIcon className={`h-3.5 w-3.5 ${config.textClass}`} />
  //           <span className={`text-xs font-semibold ${config.textClass}`}>
  //             Niveau {config.order}
  //           </span>
  //         </MotionDiv>
  //       </div>
  //     );
  //   },
  //   enableSorting: true,
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },

  // --- NOTES ---
  // {
  //   id: "notes",
  //   header: () => <TitleComponent label="Notes" />,
  //   accessorKey: "notes",
  //   cell: ({ row }) => {
  //     const notes = row.original.notes;
  //     const hasNotes = !!notes;

  //     return (
  //       <MotionDiv
  //         className="flex items-start gap-2 max-w-[250px]"
  //         whileHover={{ x: 2 }}
  //         transition={{ type: "spring", stiffness: 400, damping: 17 }}
  //       >
  //         <StickyNote
  //           className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
  //             hasNotes ? "text-amber-600/70" : "text-muted-foreground/40"
  //           }`}
  //         />
  //         {hasNotes ? (
  //           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
  //             {notes}
  //           </p>
  //         ) : (
  //           <span className="text-xs text-muted-foreground/60 italic">
  //             No notes
  //           </span>
  //         )}
  //       </MotionDiv>
  //     );
  //   },
  //   enableSorting: false,
  // },

  // --- CREATED AT ---
  {
    id: "createdAt",
    header: () => (
      <TitleComponent className="flex justify-end" label="Créé le" />
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;

      return (
        <div className="flex items-center justify-end gap-2">
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
      return <LocationActionCell row={row} />;
    },
    enableSorting: false,
  },
];
