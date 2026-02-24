import { api } from "@/lib/axios";
import { Purchase, PurchaseLine } from "../types/purchasing.types";

class PurchasingAPI {
  async list(params: any) {
    const res = await api.get("/purchases", { params });
    return res.data;
  }

  async get(id: string) {
    const res = await api.get<{ purchase: Purchase; lines: PurchaseLine[] }>(
      `/purchases/${id}`
    );
    return res.data;
  }

  async create(body: any) {
    const res = await api.post("/purchases", body);
    return res.data;
  }

  // Only for draft
  async update(id: string, body: any) {
    const res = await api.patch(`/purchases/${id}`, body);
    return res.data;
  }

  async cancel(id: string) {
    const res = await api.delete(`/purchases/${id}/cancel`);
    return res.data;
  }

  async confirm(id: string) {
    const res = await api.post(`/purchases/${id}/confirm`);
    return res.data;
  }
}

export const purchasingApi = new PurchasingAPI();
