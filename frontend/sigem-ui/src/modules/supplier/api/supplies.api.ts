import { api } from "@/lib/axios";

export const suppliesApi = {
  // ITEMS
  listItems: async (params?: { search?: string; active?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (typeof params?.active === "boolean")
      q.set("active", String(params.active));

    const res = await api.get(`/supplies/items?${q.toString()}`);
    return res.data;
  },

  getItemById: async (id: string) => {
    const res = await api.get(`/supplies/items/${id}`);
    return res.data;
  },

  createItem: async (body: { label: string; unit?: string | null }) => {
    const res = await api.post(`/supplies/items`, body);
    return res.data;
  },

  updateItem: async (id: string, body: any) => {
    const res = await api.patch(`/supplies/items/${id}`, body);
    return res.data;
  },

  disableItem: async (id: string) => {
    const res = await api.patch(`/supplies/items/${id}/disable`);
    return res.data;
  },

  enableItem: async (id: string) => {
    const res = await api.patch(`/supplies/items/${id}/enable`);
    return res.data;
  },

  // PRICES
  listPrices: async (params?: { supplierId?: string; itemId?: string }) => {
    const q = new URLSearchParams();
    if (params?.supplierId) q.set("supplierId", params.supplierId);
    if (params?.itemId) q.set("itemId", params.itemId);

    const res = await api.get(`/supplies/prices?${q.toString()}`);
    return res.data;
  },

  getPriceById: async (id: string) => {
    const res = await api.get(`/supplies/prices/${id}`);
    return res.data;
  },

  upsertPrice: async (body: {
    supplierId: string;
    itemId: string;
    unitPrice: number;
    source?: any;
  }) => {
    const res = await api.post(`/supplies/prices/upsert`, body);
    return res.data;
  },

  updatePrice: async (id: string, body: any) => {
    const res = await api.patch(`/supplies/prices/${id}`, body);
    return res.data;
  },

  removePrice: async (id: string) => {
    const res = await api.delete(`/supplies/prices/${id}`);
    return res.data;
  },

  // PLANS
  listPlans: async (params?: { status?: string; q?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.q) q.set("q", params.q);

    const res = await api.get(`/supplies/plans?${q.toString()}`);
    return res.data;
  },

  getPlanById: async (id: string) => {
    const res = await api.get(`/supplies/plans/${id}`);
    return res.data;
  },

  createPlan: async (body: any) => {
    const res = await api.post(`/supplies/plans`, body);
    return res.data;
  },

  updatePlan: async (id: string, body: any) => {
    const res = await api.patch(`/supplies/plans/${id}`, body);
    return res.data;
  },

  autoPrice: async (id: string) => {
    const res = await api.post(`/supplies/plans/${id}/auto-price`);
    return res.data;
  },

  changeStatus: async (id: string, body: { to: string; note?: string }) => {
    const res = await api.post(`/supplies/plans/${id}/status`, body);
    return res.data;
  },
};
