import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "../types/query-keys.purchasing";
import { productsApi } from "../api/product.api";
import { purchasingApi } from "../api/purchasing.api";
import { purchaseRequestsApi } from "../api/requests.api";
import { providerApi } from "../api/provider.api";
import { useModalStore } from "@/stores/modal-store";

// ---------- PRODUCTS ----------
export function useProducts(params: any) {
  return useQuery({
    queryKey: qk.products(params),
    queryFn: () => productsApi.list(params).then((r) => (r as any).data ?? r),
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: id ? qk.product(id) : ["products", "noop"],
    enabled: Boolean(id),
    queryFn: () => productsApi.get(id!).then((r) => (r as any).data ?? r),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { closeModal } = useModalStore();
  return useMutation({
    mutationFn: (body: any) =>
      productsApi.create(body).then((r) => (r as any).data ?? r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.products() });
      closeModal();
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const { closeModal } = useModalStore();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      productsApi.update(id, body).then((r) => (r as any).data ?? r),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.product(vars.id) });
      qc.invalidateQueries({ queryKey: qk.products() });
      closeModal();
    },
  });
}

// ---------- PURCHASES ----------
export function usePurchases(params: any) {
  return useQuery({
    queryKey: qk.purchases(params),
    queryFn: () => purchasingApi.list(params).then((r) => (r as any).data ?? r),
  });
}

export function usePurchase(id?: string) {
  return useQuery({
    queryKey: id ? qk.purchase(id) : ["purchases", "noop"],
    enabled: Boolean(id),
    queryFn: () => purchasingApi.get(id!).then((r) => (r as any).data ?? r),
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) =>
      purchasingApi.create(body).then((r) => (r as any).data ?? r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.purchases() });
      // provider catalog depends on purchases; UI will refresh when opening provider tab
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useUpdatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      purchasingApi.update(id, body).then((r) => (r as any).data ?? r),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.purchase(vars.id) });
      qc.invalidateQueries({ queryKey: qk.purchases() });
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useCancelPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      purchasingApi.cancel(id).then((r) => (r as any).data ?? r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.purchases() });
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

// ---------- PURCHASE REQUESTS ----------
export function usePurchaseRequests(params: any) {
  return useQuery({
    queryKey: qk.requests(params),
    queryFn: () =>
      purchaseRequestsApi.list(params).then((r) => (r as any).data ?? r),
  });
}

export function usePurchaseRequest(id?: string) {
  return useQuery({
    queryKey: id ? qk.request(id) : ["purchase-requests", "noop"],
    enabled: Boolean(id),
    queryFn: () =>
      purchaseRequestsApi.get(id!).then((r) => (r as any).data ?? r),
  });
}

export function useCreatePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) =>
      purchaseRequestsApi.create(body).then((r) => (r as any).data ?? r),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.requests() }),
  });
}

export function useRequestAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      purchaseRequestsApi.action(id, action).then((r) => (r as any).data ?? r),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.request(vars.id) });
      qc.invalidateQueries({ queryKey: qk.requests() });
    },
  });
}

export function useConvertRequestToPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: any }) =>
      purchaseRequestsApi.convert(id, body).then((r) => (r as any).data ?? r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.requests() });
      qc.invalidateQueries({ queryKey: qk.purchases() });
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

// ---------- PROVIDER CATALOG (Tab) ----------
export function useProviderCatalog(providerId?: string, params?: any) {
  return useQuery({
    queryKey: providerId
      ? qk.providerCatalog(providerId, params)
      : ["providers", "catalog", "noop"],
    enabled: Boolean(providerId),
    queryFn: () =>
      providerApi
        .catalog(providerId!, params ?? {})
        .then((r) => (r as any).data ?? r),
  });
}

// ---------- PRICE COMPARE (Step 3.5) ----------
export function useProductPriceCompare(productId?: string, params?: any) {
  return useQuery({
    queryKey: productId
      ? qk.productPriceCompare(productId, params)
      : ["products", "compare", "noop"],
    enabled: Boolean(productId),
    queryFn: () =>
      productsApi
        .comparePrices(productId!, params ?? {})
        .then((r) => (r as any).data ?? r),
  });
}
