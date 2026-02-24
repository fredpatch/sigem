import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suppliesApi } from "../api/supplies.api";

export const suppliesKeys = {
  items: ["supplies-items"] as const,
  prices: ["supplies-prices"] as const,
  plans: ["supplies-plans"] as const,
};

// ITEMS
export function useSupplyItems(params?: {
  search?: string;
  active?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...suppliesKeys.items, params],
    queryFn: () => suppliesApi.listItems(params),
  });
}

export function useSupplyItem(id: string) {
  return useQuery({
    queryKey: [...suppliesKeys.items, id],
    queryFn: () => suppliesApi.getItemById(id),
    enabled: !!id,
  });
}

export function useCreateSupplyItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: suppliesApi.createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliesKeys.items }),
  });
}

export function useUpdateSupplyItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => suppliesApi.updateItem(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliesKeys.items }),
  });
}

export function useDisableSupplyItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliesApi.disableItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliesKeys.items }),
  });
}

export function useEnableSupplyItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliesApi.enableItem(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: suppliesKeys.items });
      qc.invalidateQueries({ queryKey: [...suppliesKeys.items, id] });
    },
  });
}

// PRICES
export function useSupplierPrices(
  supplierId?: string,
  itemId?: string,
  limit?: number,
) {
  return useQuery({
    queryKey: [...suppliesKeys.prices, supplierId, itemId, limit],
    queryFn: () => suppliesApi.listPrices({ supplierId, itemId, limit }),
  });
}

export function useSupplierPrice(id: string) {
  return useQuery({
    queryKey: [...suppliesKeys.prices, id],
    queryFn: () => suppliesApi.getPriceById(id),
    enabled: !!id,
  });
}

export function useUpsertSupplierPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => suppliesApi.upsertPrice(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliesKeys.prices }),
  });
}

export function useUpdateSupplierPrice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => suppliesApi.updatePrice(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliesKeys.prices }),
  });
}

export function useRemoveSupplierPrice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => suppliesApi.removePrice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliesKeys.prices }),
  });
}

// PLANS
export function useSupplyPlans(status?: string, q?: string) {
  return useQuery({
    queryKey: [...suppliesKeys.plans, status, q],
    queryFn: () => suppliesApi.listPlans({ status, q }),
  });
}

export function useSupplyPlan(id?: string) {
  return useQuery({
    queryKey: [...suppliesKeys.plans, "details", id],
    queryFn: () => suppliesApi.getPlanById(id!),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useCreateSupplyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => suppliesApi.createPlan(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliesKeys.plans }),
  });
}

export function useUpdateSupplyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      suppliesApi.updatePlan(id, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: suppliesKeys.plans });
      qc.invalidateQueries({
        queryKey: [...suppliesKeys.plans, "detail", vars.id],
      });
    },
  });
}

export function useAutoPricePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliesApi.autoPrice(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: suppliesKeys.plans });
      qc.invalidateQueries({
        queryKey: [...suppliesKeys.plans, "details", id],
      });
    },
  });
}

export function useChangePlanStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) =>
      suppliesApi.changeStatus(id, { to }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: suppliesKeys.plans });
      qc.invalidateQueries({
        queryKey: [...suppliesKeys.plans, "details", vars.id],
      });
    },
  });
}

// DASHBOARD
export function useSuppliesDashboard(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["supplies-dashboard", params?.from ?? null, params?.to ?? null],
    queryFn: () => suppliesApi.getDashboard(params),
    staleTime: 60_000,
  });
}

export function useSuppliesSideKpis(days: number = 30) {
  return useQuery({
    queryKey: ["supplies-dashboard", "side", days],
    queryFn: async () => suppliesApi.getSideKpis({ days }),
    refetchInterval: 60_000, // optional, feels “live”
  });
}
