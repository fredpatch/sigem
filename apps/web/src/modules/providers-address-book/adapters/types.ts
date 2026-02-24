import {
  Provider,
  ProviderFilters,
  ProviderSort,
  PaginationParams,
  ListResponse,
} from "../types";

export interface ProviderDataSource {
  list(
    filters?: ProviderFilters,
    sort?: ProviderSort,
    pagination?: PaginationParams,
  ): Promise<ListResponse<Provider>>;

  getById(id: string): Promise<Provider | null>;

  create(
    provider: Omit<Provider, "id" | "createdAt" | "updatedAt">,
  ): Promise<Provider>;

  update(id: string, provider: Partial<Provider>): Promise<Provider>;

  disable(id: string): Promise<void>;

  enable(id: string): Promise<void>;

  delete?(id: string): Promise<void>;
}
