// employee-directory.api.ts
import { api } from "@/lib/axios";

export type EmployeeDirectoryItem = {
  matricule: string;
  firstName: string;
  lastName: string;
  direction: string;
  fonction: string;
};

export type EnrichedDirectoryEmployee = {
  matricule: string;
  firstName: string;
  lastName: string;
  direction: string;
  fonction: string;
  sigem: {
    exists: boolean;
    status?: "PENDING" | "ACTIVE" | "DISABLED";
    role?: string;
    is2FAValidated?: boolean;
    is2FAEnabled?: boolean;
    lastLogin?: string;
  };
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export async function searchDirectory(q: string) {
  const res = await api.get<EmployeeDirectoryItem[]>(
    `/directory/search?q=${encodeURIComponent(q)}`
  );
  return res.data;
}

export async function searchDirectoryEnriched(q: string) {
  const res = await api.get<EnrichedDirectoryEmployee[]>(
    `/directory/enriched-search?q=${encodeURIComponent(q)}`
  );
  return res.data;
}

export async function getDirectoryEmployee(matricule: string) {
  const res = await api.get<EmployeeDirectoryItem>(
    `/directory/${encodeURIComponent(matricule)}`
  );
  return res.data;
}

export async function listAllDirectoryEmployees(params: {
  q?: string;
  page?: number;
  limit?: number;
  direction?: string;
  fonction?: string;
}) {
  const res = await api.get<Paginated<EmployeeDirectoryItem>>("/directory", {
    params,
  });
  return res.data;
}
