import { api } from "@/lib/axios";
import {
  VehicleTaskTemplate,
  CreateVehicleTaskTemplateDTO,
  UpdateVehicleTaskTemplateDTO,
} from "../types/types";
import { ApiResponse } from "@/lib/api";

const vehicleTaskTemplates = api;

export const VehicleTaskTemplateAPI = {
  async list(dept?: string): Promise<VehicleTaskTemplate[]> {
    const res = await vehicleTaskTemplates.get<
      ApiResponse<VehicleTaskTemplate[]>,
      ApiResponse<VehicleTaskTemplate[]>
    >("/vehicle-task-templates/task-templates", {
      params: { dept },
    });

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to fetch templates");
    }

    return res.data;
  },

  async create(
    payload: CreateVehicleTaskTemplateDTO
  ): Promise<VehicleTaskTemplate> {
    const res = await vehicleTaskTemplates.post<
      ApiResponse<VehicleTaskTemplate>,
      ApiResponse<VehicleTaskTemplate>
    >("/vehicle-task-templates/task-templates", payload);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to create template");
    }

    return res.data;
  },

  async update(
    id: string,
    payload: UpdateVehicleTaskTemplateDTO
  ): Promise<VehicleTaskTemplate> {
    const res = await vehicleTaskTemplates.post<
      ApiResponse<VehicleTaskTemplate>,
      ApiResponse<VehicleTaskTemplate>
    >(`/vehicle-task-templates/task-templates/${id}`, payload);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Failed to create template");
    }

    return res.data;
  },
};
