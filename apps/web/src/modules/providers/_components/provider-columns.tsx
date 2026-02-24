import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Building2, Mail, Phone, Copy, Send } from "lucide-react";

import type { ProviderRow } from "../types/provider-row";
import { ProviderActionCell } from "./provider-action-cell";
import TitleComponent from "@/components/shared/table/title.component";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

function compactJoin(arr?: string[], fallback = "—") {
  const clean = (arr ?? []).filter(Boolean);
  if (clean.length === 0) return fallback;
  if (clean.length <= 2) return clean.join(" · ");
  return `${clean.slice(0, 2).join(" · ")} (+${clean.length - 2})`;
}

export const providerColumns: ColumnDef<ProviderRow>[] = [
  // --- SELECT ---
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

  // --- NOM ---
  {
    id: "name",
    header: () => <TitleComponent className="flex justify-start" label="Nom" />,
    accessorKey: "name",
    cell: ({ row }) => {
      const inactive = !row.original.isActive;
      const { name, designation, type, isActive } = row.original;

      return (
        <MotionDiv
          className="flex items-center gap-3 py-1 min-w-0"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className={cn(
                "text-sm font-medium text-foreground/90 truncate",
                inactive && "line-through text-gray-400"
              )}
            >
              {name}
            </span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] text-muted-foreground/80 truncate">
                {designation || "—"}
              </span>
              {type && (
                <Badge variant="secondary" className="text-[10px] rounded-none">
                  {type}
                </Badge>
              )}
              {inactive && (
                <Badge
                  variant="outline"
                  className="text-[10px] rounded-none border-amber-500/40 text-amber-700"
                >
                  INACTIF
                </Badge>
              )}
            </div>
          </div>
        </MotionDiv>
      );
    },
    enableSorting: true,
    meta: { filterVariant: "text" },
  },

  // --- CONTACTS (PHONES) ---
  {
    id: "phones",
    header: () => (
      <TitleComponent className="flex justify-start" label="Contacts" />
    ),
    accessorKey: "phones",
    cell: ({ row }) => {
      const phones = row.original.phones ?? [];
      const primary = phones[0];

      return (
        <div className="flex items-start gap-3 min-w-0 max-w-[260px]">
          <div className="mt-0.5 flex border h-8 w-8 items-center justify-center rounded-md bg-black/10">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-foreground line-clamp-1">
              {primary || "—"}
            </span>
            <span className="text-[11px] text-muted-foreground/80 line-clamp-1">
              {compactJoin(phones)}
            </span>
          </div>
        </div>
      );
    },
    enableSorting: false,
    meta: { filterVariant: "text" }, // marche avec ton Filter (arrays flatten)
  },

  // --- EMAILS ---
  {
    id: "emails",
    header: () => (
      <TitleComponent className="flex justify-start" label="Emails" />
    ),
    accessorKey: "emails",
    cell: ({ row }) => {
      const emails = row.original.emails ?? [];
      const primary = emails[0];

      return (
        <div className="flex items-center justify-between gap-3 min-w-0 max-w-[360px]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex border h-8 w-8 items-center justify-center rounded-md bg-black/10">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-foreground line-clamp-1">
                {primary || "—"}
              </span>
              <span className="text-[11px] text-muted-foreground/80 line-clamp-1">
                {compactJoin(emails)}
              </span>
            </div>
          </div>
          <div className="">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(primary, "Email copié")}
              title="Copier"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <a href={`mailto:${primary}`} title="Envoyer un email">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Send className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      );
    },
    enableSorting: false,
    meta: { filterVariant: "text" },
  },

  // --- SITE ---
  //   {
  //     id: "website",
  //     header: () => (
  //       <TitleComponent className="flex justify-start" label="Site" />
  //     ),
  //     accessorKey: "website",
  //     cell: ({ row }) => {
  //       const site = row.original.website;

  //       return (
  //         <div className="flex items-center gap-2 min-w-0">
  //           <Globe className="h-4 w-4 text-muted-foreground/70" />
  //           <span className="text-xs text-muted-foreground line-clamp-1">
  //             {site || "—"}
  //           </span>
  //         </div>
  //       );
  //     },
  //     enableSorting: true,
  //     meta: { filterVariant: "text" },
  //   },

  // --- ACTIONS ---
  {
    id: "actions",
    header: () => (
      <span className="flex justify-end text-xs font-medium text-muted-foreground">
        Actions
      </span>
    ),
    cell: ({ row }) => <ProviderActionCell row={row} />,
    enableSorting: false,
  },
];
