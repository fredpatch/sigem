/**
 * Types "API response" standard côté SIGEM
 * - Ton axios interceptor renvoie déjà response.data
 * - Donc api.get(...) => directement le payload
 */
export type ProviderType = "FOURNISSEUR" | "PRESTATAIRE";

export interface Provider {
  id: string;
  name: string;
  designation: string;
  type?: ProviderType;

  phones: string[];
  emails: string[];
  website?: string;

  notes?: string;
  tags: string[];
  dept?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProvidersListQuery {
  search?: string;
  active?: boolean;
  type?: ProviderType;
  dept?: string;

  withoutContact?: boolean;

  page?: number;
  limit?: number;

  sort?: "name" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface ProvidersListResponse {
  items: Provider[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Payloads (alignés avec Zod backend)
export interface CreateProviderInput {
  name: string;
  designation: string;
  type?: ProviderType;
  phones?: string[]; // backend accepte string|string[]
  emails?: string[];
  website?: string;
  notes?: string;
  tags?: string[];
  dept?: string;
  isActive?: boolean;
}

export type UpdateProviderInput = Partial<CreateProviderInput>;

/**
 * Helpers
 */
export function toQueryParams(q: ProvidersListQuery) {
  // backend attend active en "true"/"false" (string) via query
  return {
    ...q,
    active: q.active === undefined ? undefined : String(q.active),
    page: q.page?.toString(),
    limit: q.limit?.toString(),
  };
}
