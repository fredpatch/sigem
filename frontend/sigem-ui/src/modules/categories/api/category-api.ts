import { api } from "@/lib/axios";

export class CategoryAPI {
  static async list() {
    const response = await api.get<any>("/categories");

    // console.log(response);
    return response.data;
  }

  static async create(data: unknown) {
    const response = await api.post<any>("/categories", data);

    // console.log(response);
    return response.data;
  }

  static async listById(id: string) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  static async update(data: unknown, id: string) {
    const response = await api.patch(`/categories/${id}`, { data });
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/categories/${id}/delete`);
    return response.data;
  }
}
