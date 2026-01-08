import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  listAllDirectoryEmployees,
  searchDirectory,
  searchDirectoryEnriched,
} from "../api/employee.api";

type ListParams = {
  q?: string;
  page?: number;
  limit?: number;
  direction?: string;
  fonction?: string;
};

export function useEmployeeDirectorySearch(q: string) {
  return useQuery({
    queryKey: ["directory-search", q],
    queryFn: () => searchDirectory(q),
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
}

export function useDirectorySearchEnriched(q: string) {
  return useQuery({
    queryKey: ["directory-search-enriched", q],
    queryFn: () => searchDirectoryEnriched(q),
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
}

export function useEmployeeDirectoryListAll(params: ListParams = {}) {
  const limit = params.limit ?? 50;

  return useInfiniteQuery({
    queryKey: ["directory-all", { ...params, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listAllDirectoryEmployees({
        q: undefined,
        page: pageParam,
        limit,
        direction: params.direction,
        fonction: params.fonction,
      }),
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage;
      const hasMore = page * limit < total;
      return hasMore ? page + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
}

export function useEmployeeDirectoryListAllSmall(limit = 300) {
  return useQuery({
    queryKey: ["directory-all-small", limit],
    queryFn: () => listAllDirectoryEmployees({ page: 1, limit }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
}
