import { api } from "@/lib/axios";

class ProductsAPI {
  async list(params: any) {
    const res = await api.get("/products", { params });
    return res.data;
  }

  async get(id: string) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  }

  async create(body: any) {
    const res = await api.post("/products", body);
    return res.data;
  }

  async update(id: string, body: any) {
    const res = await api.patch(`/products/${id}`, body);
    return res.data;
  }

  async comparePrices(productId: string, params: any) {
    const res = await api.get(`/products/${productId}/price-compare`, {
      params,
    });

    return res.data;
  }
}

export const productsApi = new ProductsAPI();
