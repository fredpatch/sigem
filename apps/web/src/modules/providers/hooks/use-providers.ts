// src/features/providers/hooks/use-providers.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { providerApi } from "../api/provider.api";
import type {
  Provider,
  ProvidersListQuery,
  ProvidersListResponse,
  CreateProviderInput,
  UpdateProviderInput,
} from "../types/types";
import { useModalStore } from "@/stores/modal-store";

/**
 * Query keys (stable)
 */
export const providerKeys = {
  all: ["providers"] as const,
  list: (query: ProvidersListQuery) =>
    [...providerKeys.all, "list", query] as const,
  detail: (id: string) => [...providerKeys.all, "detail", id] as const,
};

/**
 * LIST
 */
export function useProvidersList(query: ProvidersListQuery) {
  return useQuery<ProvidersListResponse, any>({
    queryKey: providerKeys.list(query),
    queryFn: () => providerApi.list(query),
    staleTime: 30_000,
  });
}

/**
 * GET ONE
 */
export function useProvider(id?: string) {
  return useQuery<Provider, any>({
    queryKey: id ? providerKeys.detail(id) : providerKeys.detail(""),
    enabled: Boolean(id),
    queryFn: () => providerApi.getById(id!),
    staleTime: 30_000,
  });
}

/**
 * CREATE
 */
export function useCreateProvider() {
  const qc = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation({
    mutationFn: async (payload: CreateProviderInput) =>
      await providerApi.create(payload),
    onSuccess: () => {
      closeModal();
      // refresh lists
      qc.invalidateQueries({ queryKey: providerKeys.all });
    },
  });
}

/**
 * UPDATE
 */
export function useUpdateProvider() {
  const qc = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProviderInput;
    }) => await providerApi.update(id, payload),
    onSuccess: (_updated, vars) => {
      closeModal();
      // refresh list + detail
      qc.invalidateQueries({ queryKey: providerKeys.all });
      qc.invalidateQueries({ queryKey: providerKeys.detail(vars.id) });
    },
  });
}

/**
 * DISABLE (soft delete)
 */
export function useDisableProvider() {
  const qc = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation({
    mutationFn: async (id: string) => await providerApi.disable(id),
    onSuccess: (_data, id) => {
      closeModal();
      qc.invalidateQueries({ queryKey: providerKeys.all });
      qc.invalidateQueries({ queryKey: providerKeys.detail(id) });
    },
  });
}

/**
 * ACTIVATE
 */
export function useActivateProvider() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await providerApi.activate(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: providerKeys.all });
      qc.invalidateQueries({ queryKey: providerKeys.detail(id) });
    },
  });
}

/**
 * STATS
 */
export function useProviderStats() {
  return useQuery({
    queryKey: providerKeys.all,
    queryFn: () => providerApi.stats(),
    staleTime: 60_000,
  });
}
