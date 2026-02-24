/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CSSProperties, useEffect, useId, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { TableHeaderComponent } from "./table-header.component";
import { TablePagination } from "./pagination.component";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableToolbar } from "./table-toolbar";
import { DateRange } from "react-day-picker";
import { DateRangePickerControlled } from "../date-range";
import { loadTableState, saveTableState } from "@/utils/table-persist";
import { Skeleton } from "@/components/ui/skeleton";
// import { useDebouncedValue } from "@/modules/users/_components/use-debounced";

declare module "@tanstack/react-table" {
  // allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select" | "date-range";
    label?: string;
    placeholder?: string;
    valueLabels?: Record<string, string>;

    // ✅ NEW export
    exportValue?: (row: TData) => string | number | null | undefined;
  }
}

export type TableToolbarAction = {
  key: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "default" | "lg" | "icon";
  disabled?: boolean;
};

export interface TableToolbarConfig {
  tableId?: string;

  enableGlobalSearch?: boolean;
  globalSearchPlaceholder?: string;

  enableResetFilters?: boolean;

  /** clés des colonnes à afficher comme filtres */
  columnFilters?: string[];

  actions?: TableToolbarAction[];

  /** presets métier (chips) */
  presets?: {
    variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
    label: string;
    apply: (table: any) => void;
  }[];

  /** activer export (on branchera après) */
  enableExport?: boolean;
  export?: {
    enableColumnPicker?: boolean;
    defaultToVisibleColumns?: boolean; // true par défaut
    formats?: Array<"csv" | "xlsx" | "pdf">; // défaut: ["csv"]
    filename?: string; // défaut auto
  };
}

export interface TableProps<TData, TValue> {
  // EXISTANT
  items: TData[];
  columns: ColumnDef<TData, TValue>[];

  // NEW
  toolbar?: TableToolbarConfig;

  // EXISTANT
  emptyState?: React.ReactNode;
  onSubmit?: () => void;
  onBulkAction?: (selectedRows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean; // ✅ NEW

  isEnabled?: boolean;
  btnActionIcon?: React.ReactNode;
  renderRowActions?: (row: TData) => React.ReactNode;
}

export function TableComponent<TData, TValue>({
  items,
  columns,
  toolbar,
  onSubmit,
  // onRowClick,
  isLoading,
  isEnabled,
  emptyState,
  btnActionIcon,
  renderRowActions,
}: TableProps<TData, TValue>) {
  const tableId = toolbar?.tableId;

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const base: Record<string, boolean> = {};

    // hide helper columns by default
    base["belowMin"] = false;
    return base;
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  // const debouncedGlobalFilter = useDebouncedValue(globalFilter, 200);

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = loadTableState(tableId)?.columnOrder;
    const base = columns.map((c) => c.id as string);
    // si saved invalide → fallback base
    if (!saved?.length) return base;
    const available = new Set(base);
    const cleaned = saved.filter((id) => available.has(id));
    // ensure all columns exist
    const missing = base.filter((id) => !cleaned.includes(id));
    return [...cleaned, ...missing];
  });
  const persisted = loadTableState(tableId);

  // const [columnOrder, setColumnOrder] = useState<string[]>(
  //   columns.map((column) => column.id as string),
  // );
  const [sorting, setSorting] = useState<SortingState>([
    // {
    //   id: filterKey || "email",
    //   desc: false,
    // },
  ]);

  useEffect(() => {
    if (!tableId) return;
    saveTableState(tableId, { columnOrder });
  }, [tableId, columnOrder]);

  const table = useReactTable({
    data: items,
    columns,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    onColumnOrderChange: setColumnOrder,

    state: {
      sorting,
      columnOrder,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client-side filtering
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
    getPaginationRowModel: getPaginationRowModel(), // client-side pagination
    onSortingChange: setSorting,
    enableSortingRemoval: false,

    initialState: {
      pagination: {
        pageSize: persisted?.pageSize ?? 8,
        pageIndex: persisted?.pageIndex ?? 0,
      },
    },
  });

  useEffect(() => {
    if (!tableId) return;
    const s = table.getState().pagination;
    saveTableState(tableId, { pageSize: s.pageSize, pageIndex: s.pageIndex });
  }, [tableId, table]);

  // Reorder Column after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  return (
    <div className="space-y-4 bg-white p-4 rounded-md mt-4 shadow-2xl">
      {/* Filters */}
      {toolbar && <TableToolbar table={table} config={toolbar} />}

      <div className="flex flex-wrap justify-between gap-3">
        {/* Buttons */}
        <div className="flex items-center justify-end gap-2">
          {isEnabled && (
            <Button onClick={onSubmit} size="icon">
              {btnActionIcon}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <DndContext
        id={useId()}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table className="w-full table-fixed">
          <TableHeaderComponent columnOrder={columnOrder} table={table} />

          <SortableContext
            // key={cell.id}
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {isLoading ? (
              Array.from({ length: table.getState().pagination.pageSize }).map(
                (_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {table.getVisibleLeafColumns().map((c) => (
                      <TableCell key={`sk-${i}-${c.id}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                    {renderRowActions && (
                      <TableCell>
                        <Skeleton className="h-8 w-20" />
                      </TableCell>
                    )}
                  </TableRow>
                ),
              )
            ) : (
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      // onClick={() => onRowClick?.(row.original)}
                      // className={cn(
                      //   onRowClick &&
                      //     "cursor-pointer hover:bg-muted/30 transition-colors",
                      // )}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <DragAlongCell key={cell.id} cell={cell} />
                      ))}
                      {renderRowActions && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {renderRowActions(row.original)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {emptyState || "No results."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </SortableContext>
        </Table>
      </DndContext>

      <TablePagination table={table} />
    </div>
  );
}

export function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId();
  const columnFilterValue = column?.getFilterValue();
  const meta = column?.columnDef.meta ?? {};
  const { filterVariant } = meta;

  // const columnHeader =
  //   typeof column?.columnDef.header === "string" ? column.columnDef.header : "";
  const columnHeader =
    meta.label ??
    (typeof column?.columnDef.header === "string"
      ? column.columnDef.header
      : "") ??
    column.id;

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === "range") return [];

    // Get all unique values from the column
    const values = Array.from(column.getFacetedUniqueValues().keys());

    // If the values are arrays, flatten them and get unique items
    const flattenedValues = values.reduce((acc: string[], curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr];
      }
      return [...acc, curr];
    }, []);

    // Get unique values and sort them
    return Array.from(new Set(flattenedValues)).sort();
  }, [column.getFacetedUniqueValues(), filterVariant]);

  if (filterVariant === "date-range") {
    const [from, to] = (columnFilterValue as [string?, string?]) ?? [];

    const value: DateRange | undefined =
      from || to
        ? {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
          }
        : undefined;

    return (
      <DateRangePickerControlled
        label={columnHeader}
        value={value}
        onChange={(range) => {
          const next: [string?, string?] = [
            range?.from ? range.from.toISOString() : undefined,
            range?.to ? range.to.toISOString() : undefined,
          ];
          // si rien, on reset
          const isEmpty = !next[0] && !next[1];
          column.setFilterValue(isEmpty ? undefined : next);
        }}
      />
    );
  }

  if (filterVariant === "range") {
    return (
      <div className="space-y-2">
        {/* <Label>{columnHeader}</Label> */}
        <div className="flex gap-2">
          <Input
            id={`${id}-range-1`}
            className="flex-1 rounded-e-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                e.target.value ? Number(e.target.value) : undefined,
                old?.[1],
              ])
            }
            placeholder="Min"
            type="number"
            aria-label={`${columnHeader} min`}
          />
          <Input
            id={`${id}-range-2`}
            className="-ms-px flex-1 rounded-s-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                e.target.value ? Number(e.target.value) : undefined,
              ])
            }
            placeholder="Max"
            type="number"
            aria-label={`${columnHeader} max`}
          />
        </div>
      </div>
    );
  }

  if (filterVariant === "select") {
    return (
      <div className="space-y-2">
        {/* <Label htmlFor={`${id}-select`}>{columnHeader}</Label> */}
        <Select
          value={columnFilterValue?.toString() ?? "all"}
          onValueChange={(value) => {
            column.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger id={`${id}-select`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {sortedUniqueValues.map((value) => (
              <SelectItem key={String(value)} value={String(value)}>
                {String(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (filterVariant === "text" || !filterVariant) {
    // 🔥 Construire un placeholder avec quelques valeurs disponibles
    const exampleValues = sortedUniqueValues.slice(0, 3); // on limite à 3 exemples
    const examplesLabel = exampleValues.length
      ? ` (ex: ${exampleValues.join(", ")})`
      : "";

    const placeholderText = `Rechercher ${columnHeader.toLowerCase()}${examplesLabel}`;

    return (
      <div className="space-y-2 -translate-y-1">
        {/* <Label htmlFor={`${id}-input`}>{columnHeader}</Label> */}
        <div className="relative">
          <Input
            id={`${id}-input`}
            className="peer ps-9 placeholder:text-muted-for"
            value={(columnFilterValue ?? "") as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={placeholderText}
            type="text"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search size={16} strokeWidth={2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
      <div className="relative">
        <Input
          id={`${id}-input`}
          className="peer ps-9"
          value={(columnFilterValue ?? "") as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={`Search ${columnHeader.toLowerCase()}`}
          type="text"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

const DragAlongCell = <Item, _>({ cell }: { cell: Cell<Item, _> }) => {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell ref={setNodeRef} className="truncate" style={style}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};
