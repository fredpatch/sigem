import { api } from "@/lib/axios";
import { AssetCreateInput, AssetUpdateInput } from "../schema/schema";

export class AssetAPI {
  static async list(includeDeleted?: boolean) {
    const response = await api.get<any>("/assets", { params: { includeDeleted } });
    return response.data;
  }

  static async create(payload: AssetCreateInput) {
    const response = await api.post<any>("/assets", payload);

    // console.log(response);
    return response.data;
  }

  static async listById(id: string) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  }

  static async update(id: string, payload: AssetUpdateInput) {
    const response = await api.patch(`/assets/${id}`, payload);
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/assets/${id}/delete`);
    return response.data;
  }
}
