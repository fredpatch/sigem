import { useQuery } from "@tanstack/react-query";
import { getEmployeeByMatricule } from "../api/directory.api";
import { UserAPI } from "../api/user-api";

export function useEmployee(matricule?: string) {
  return useQuery({
    queryKey: ["employee", matricule],
    queryFn: () => getEmployeeByMatricule(matricule!),
    enabled: !!matricule,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useSigemUser(matricule?: string) {
  return useQuery({
    queryKey: ["sigem-user", matricule],
    queryFn: () => UserAPI.listByMatricule(matricule!),
    enabled: !!matricule,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
}
