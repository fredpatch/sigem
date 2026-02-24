import { useState, useEffect, useCallback } from "react";
import { ProviderDataSource } from "../adapters/types";
import {
  Provider,
  ProviderFilters,
  ProviderSort,
  PaginationParams,
} from "../types";

interface UseProvidersOptions {
  dataSource: ProviderDataSource;
  initialFilters?: ProviderFilters;
  initialSort?: ProviderSort;
  pageSize?: number;
}

export function useProviders({
  dataSource,
  initialFilters = {},
  initialSort = { field: "name", direction: "asc" },
  pageSize = 10,
}: UseProvidersOptions) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProviderFilters>(initialFilters);
  const [sort, setSort] = useState<ProviderSort>(initialSort);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize,
  });

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await dataSource.list(filters, sort, pagination);
      setProviders(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load providers");
      setProviders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [dataSource, filters, sort, pagination]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const updateFilters = useCallback((newFilters: Partial<ProviderFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updateSort = useCallback((newSort: ProviderSort) => {
    setSort(newSort);
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    loadProviders();
  }, [loadProviders]);

  return {
    providers,
    total,
    loading,
    error,
    filters,
    sort,
    pagination,
    updateFilters,
    updateSort,
    goToPage,
    refresh,
  };
}
