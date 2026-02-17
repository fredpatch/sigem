// src/features/stock/hooks/use-stock.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStockMovement,
  getStock,
  getStockLocations,
  getStockMovements,
  initDefaultLocation,
  lookupSupplierPrice,
  setStockMinLevel,
} from "../api/stock.api";

export const stockKeys = {
  all: ["stock"] as const,
  list: (args: {
    locationId: string;
    search?: string;
    belowMin?: boolean;
    limit?: number;
  }) =>
    [
      "stock",
      "list",
      args.locationId,
      args.search ?? "",
      args.belowMin ?? false,
      args.limit ?? 50,
    ] as const,

  movementsAll: ["stock-movements"] as const,
  movements: (args: {
    locationId?: string;
    supplyItemId?: string;
    type?: "IN" | "OUT" | "ADJUST";
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    [
      "stock-movements",
      args.locationId ?? "",
      args.supplyItemId ?? "",
      args.type ?? "",
      args.search ?? "",
      args.page ?? 1,
      args.limit ?? 25,
    ] as const,

  kpis: (locationId?: string) => ["stock-kpis", locationId ?? ""] as const,

  locations: ["stock-locations"] as const,

  supplierPriceLookup: (supplierId?: string, itemId?: string) =>
    ["supplier-price-lookup", supplierId ?? "", itemId ?? ""] as const,
};

export function useInitStockLocation() {
  return useMutation({
    mutationFn: initDefaultLocation,
  });
}

export function useStockLocations() {
  return useQuery({
    queryKey: stockKeys.locations,
    queryFn: getStockLocations,
  });
}

export function useStockList(params: {
  locationId: string;
  search?: string;
  belowMin?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: stockKeys.list(params),
    queryFn: () => getStock(params),
    enabled: !!params.locationId,
  });
}

export function useStockMovements(params: {
  locationId?: string;
  supplyItemId?: string;
  type?: "IN" | "OUT" | "ADJUST";
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: stockKeys.movements(params),
    queryFn: () => getStockMovements(params),
  });
}

export function useLookupSupplierPrice(params?: {
  supplierId?: string;
  itemId?: string;
  enabled?: boolean;
}) {
  const enabled = params?.enabled === true;

  return useQuery({
    queryKey: stockKeys.supplierPriceLookup(params?.supplierId, params?.itemId),
    queryFn: () =>
      lookupSupplierPrice({
        supplierId: params!.supplierId!,
        itemId: params!.itemId!,
      }),
    enabled: enabled && !!params?.supplierId && !!params?.itemId,
    staleTime: 60_000,
  });
}

export function useCreateStockMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStockMovement,
    onSuccess: (_data, vars: any) => {
      // safest: invalidate everything stock-related that depends on movement
      qc.invalidateQueries({ queryKey: stockKeys.all });
      qc.invalidateQueries({ queryKey: stockKeys.movementsAll });
      qc.invalidateQueries({ queryKey: stockKeys.kpis(vars?.locationId) });
    },
  });
}

export function useSetStockMinLevel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: setStockMinLevel,
    onSuccess: (_data, vars: any) => {
      // refresh stock list + kpis
      qc.invalidateQueries({ queryKey: stockKeys.all });
      qc.invalidateQueries({ queryKey: stockKeys.kpis(vars?.locationId) });
    },
  });
}
