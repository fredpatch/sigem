import { api } from "@/lib/axios";
import {
  Paginated,
  Purchase,
  PurchaseLine,
  PurchaseRequest,
  PurchaseRequestLine,
} from "../types/purchasing.types";

class PurchaseRequestsAPI {
  async list(params: any) {
    const res = await api.get<Paginated<PurchaseRequest>>(
      "/purchase-requests",
      { params }
    );
    return res.data;
  }

  async get(id: string) {
    const res = await api.get<{
      request: PurchaseRequest;
      lines: PurchaseRequestLine[];
    }>(`/purchase-requests/${id}`);
    return res.data;
  }

  async create(body: any) {
    const res = await api.post("/purchase-requests", body);
    return res.data;
  }

  async update(id: string, body: any) {
    const res = await api.patch(`/purchase-requests/${id}`, body);
    return res.data;
  }

  async action(id: string, action: string) {
    const res = await api.post(`/purchase-requests/${id}/action`, { action });
    return res.data;
  }

  async convert(id: string, body?: string) {
    const res = await api.post(`/purchase-requests/${id}/convert`, body ?? {});
    return res.data;
  }
}

export const purchaseRequestsApi = new PurchaseRequestsAPI();
