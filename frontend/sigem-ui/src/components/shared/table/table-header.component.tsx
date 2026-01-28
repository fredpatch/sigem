/* eslint-disable @typescript-eslint/no-unused-vars */
import { flexRender } from "@tanstack/react-table";
import type { Header, Table } from "@tanstack/react-table";

import { CSSProperties } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

import { CSS } from "@dnd-kit/utilities";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";

import {
  TableRow,
  TableHead,
  TableHeader as ShadTableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const TableHeaderComponent = <TData, _>({
  table,
  columnOrder,
}: {
  table: Table<TData>;
  columnOrder: string[];
}) => {
  //   console.log("table", table.getHeaderGroups());
  return (
    <ShadTableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="bg-muted/50">
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {headerGroup.headers.map((header) => (
              <DraggableTableHeader key={header.id} header={header} />
            ))}
          </SortableContext>
        </TableRow>
      ))}
    </ShadTableHeader>
  );
};

const DraggableTableHeader = ({ header }: { header: Header<any, unknown> }) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: header.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableHead
      ref={setNodeRef}
      className="relative h-10 border-t before:absolute before:inset-y-0 before:start-0 before:w-px before:bg-border first:before:bg-transparent"
      // className="relative h-10 select-none border-t"
      style={style}
      aria-sort={
        header.column.getIsSorted() === "asc"
          ? "ascending"
          : header.column.getIsSorted() === "desc"
            ? "descending"
            : "none"
      }
    >
      <div className="flex items-center justify-start gap-0.5">
        <Button
          size="icon"
          variant="ghost"
          className="-ml-2 size-7 shadow-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical
            className="opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
        <span className="grow truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="group -mr-1 size-7 shadow-none"
          onClick={header.column.getToggleSortingHandler()}
          onKeyDown={(e) => {
            // Enhanced keyboard handling for sorting
            if (
              header.column.getCanSort() &&
              (e.key === "Enter" || e.key === " ")
            ) {
              e.preventDefault();
              header.column.getToggleSortingHandler()?.(e);
            }
          }}
        >
          {{
            asc: (
              <ChevronUp
                className="shrink-0 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            ),
            desc: (
              <ChevronDown
                className="shrink-0 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            ),
          }[header.column.getIsSorted() as string] ?? (
            <ChevronUp
              className="shrink-0 opacity-0 group-hover:opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </Button>
      </div>
    </TableHead>
  );
};
