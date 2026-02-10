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

export function useInitStockLocation() {
  return useMutation({
    mutationFn: initDefaultLocation,
  });
}

export function useStockLocations() {
  return useQuery({
    queryKey: ["stock-locations"],
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
    queryKey: ["stock", params],
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
    queryKey: ["stock-movements", params],
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
    queryKey: ["supplier-price-lookup", params?.supplierId, params?.itemId],
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: ["stock-movements"] });
    },
  });
}

export function useSetStockMinLevel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: setStockMinLevel,
    onSuccess: () => {
      // refresh stock list + kpis
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: ["stock-kpis"] });
    },
  });
}
