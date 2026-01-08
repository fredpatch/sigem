import { api } from "@/lib/axios";

export class UserAPI {
  static async list() {
    const response = await api.get<any>("/users");
    return response.data;
  }

  static async listById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  static async listByMatricule(matricule: string) {
    const response = await api.get(
      `/users/by-matricule/${encodeURIComponent(matricule)}`
    );
    return response.data;
  }

  static async update(data: unknown, id: string) {
    const response = await api.patch(`/users/${id}`, { data });
    return response.data;
  }

  static async reset(
    id: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const response = await api.patch(`/users/${id}/reset`, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  }

  static async deactivate(id: string) {
    const response = await api.post(`/users/${id}/deactivate`);
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/users/${id}/delete`);
    return response.data;
  }
}
