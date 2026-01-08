import { api as vehicleTasks } from "@/lib/axios";
import {
  CompleteVehicleTaskDTO,
  CreateVehicleTaskDTO,
  UpdateVehicleTaskDTO,
  VehicleTask,
  VehicleTaskFilterQuery,
  VehicleTaskListResponse,
} from "../types/types";
import { ApiResponse } from "@/lib/api";

export type OilChangeInfo = {
  nextDueKm: number;
  intervalKm?: number; // optional (si tu l'as)
  lastDoneKm?: number;
  lastDoneAt?: string;
};

export const VehicleTaskAPI = {
  async create(payload: CreateVehicleTaskDTO): Promise<VehicleTask> {
    const res = await vehicleTasks.post<
      ApiResponse<VehicleTask>,
      ApiResponse<VehicleTask>
    >(`/vehicles/${payload.vehicleId}/tasks`, payload);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to create task");
    }

    return res.data;
  },

  async list(
    params?: VehicleTaskFilterQuery
  ): Promise<VehicleTaskListResponse> {
    const res = await vehicleTasks.get<
      ApiResponse<VehicleTaskListResponse>,
      ApiResponse<VehicleTaskListResponse>
    >("/vehicle-tasks", { params });

    // res est ApiResponse<VehicleTaskListResponse>
    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to fetch tasks");
    }

    return res.data;
  },

  async listByVehicle(
    vehicleId: string,
    params?: Omit<VehicleTaskFilterQuery, "vehicleId">
  ): Promise<VehicleTaskListResponse> {
    const res = await vehicleTasks.get<
      ApiResponse<VehicleTaskListResponse>,
      ApiResponse<VehicleTaskListResponse>
    >("/vehicle-tasks", {
      params: { ...params, vehicleId },
    });

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to fetch tasks");
    }

    return res.data; // <- VehicleTaskListResponse
  },

  async getById(id: string): Promise<VehicleTask> {
    const res = await vehicleTasks.get<
      ApiResponse<VehicleTask>,
      ApiResponse<VehicleTask>
    >(`/vehicle-tasks/${id}`);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Task not found");
    }

    return res.data; // <- VehicleTask
  },

  async update(
    id: string,
    payload: UpdateVehicleTaskDTO
  ): Promise<VehicleTask> {
    const res = await vehicleTasks.patch<
      ApiResponse<VehicleTask>,
      ApiResponse<VehicleTask>
    >(`/vehicle-tasks/${id}`, payload);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to update task");
    }

    return res.data; // <- VehicleTask
  },

  async complete(
    id: string,
    payload: CompleteVehicleTaskDTO
  ): Promise<VehicleTask> {
    const res = await vehicleTasks.post<
      ApiResponse<VehicleTask>,
      ApiResponse<VehicleTask>
    >(`/vehicle-tasks/${id}/complete`, payload);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to complete task");
    }

    return res.data; // <- VehicleTask
  },

  async getOilChangeInfo(id: string): Promise<any> {
    const res = await vehicleTasks.get(`/vehicles/${id}/oil-change-info`);

    return res;
  },
};
