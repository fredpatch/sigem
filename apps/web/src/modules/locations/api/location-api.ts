import { api } from "@/lib/axios";

export class LocationAPI {
  static async list() {
    const response = await api.get<any>("/locations");

    // console.log(response);
    return response.data;
  }

  static async create(data: unknown) {
    const response = await api.post<any>("/locations", data);

    // console.log(response);
    return response.data;
  }

  static async listById(id: string) {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  }

  static async update(data: unknown, id: string) {
    const response = await api.patch(`/locations/${id}`, { data });
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/locations/${id}/delete`);
    return response.data;
  }
}
