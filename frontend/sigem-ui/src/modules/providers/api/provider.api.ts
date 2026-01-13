import { api } from "@/lib/axios";
import {
  CreateProviderInput,
  Provider,
  ProvidersListQuery,
  ProvidersListResponse,
  toQueryParams,
  UpdateProviderInput,
} from "../types/types";
import { Paginated, ProviderCatalogItem } from "../types/purchasing.types";

/**
 * API calls
 */
class ProviderAPI {
  async list(params: ProvidersListQuery): Promise<ProvidersListResponse> {
    const queryParams = toQueryParams(params);
    const res = await api.get<ProvidersListResponse>("/providers", {
      params: queryParams,
    });

    console.log(
      "ProviderAPI.list params:",
      params,
      "queryParams:",
      queryParams,
      "res:",
      res
    );

    return res.data;
  }

  async getById(id: string): Promise<Provider> {
    const res = await api.get<Provider>(`/providers/${id}`);
    return res.data;
  }

  async create(payload: CreateProviderInput) {
    return api.post<any>("/providers", payload);
  }

  async update(id: string, payload: UpdateProviderInput) {
    return api.patch<{ data: Provider }>(`/providers/${id}`, payload);
  }

  async disable(id: string) {
    return api.delete<{ data: Provider }>(`/providers/${id}`);
  }

  async activate(id: string) {
    return api.post<{ data: Provider }>(`/providers/${id}/activate`);
  }

  async stats() {
    const res = await api.get("/providers/stats");
    return res.data;
  }

  async catalog(providerId: string, params: any) {
    const res = await api.get<Paginated<ProviderCatalogItem>>(
      `/providers/${providerId}/catalog`,
      { params }
    );
    return res.data;
  }
}

export const providerApi = new ProviderAPI();
