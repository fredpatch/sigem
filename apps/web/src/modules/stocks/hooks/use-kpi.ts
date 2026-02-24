// src/features/stock/hooks/use-stock-kpis.ts
import { useQuery } from "@tanstack/react-query";
import { getStockKpis } from "../api/stock.api";

export function useStockKpis(locationId?: string) {
  return useQuery({
    queryKey: ["stock-kpis", locationId],
    queryFn: () => getStockKpis(locationId!),
    enabled: !!locationId,
    staleTime: 30_000,
  });
}
