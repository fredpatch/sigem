import { api as vehicles } from "@/lib/axios";
import {
  CreateVehicleDTO,
  ListVehiclesQuery,
  PaginatedVehicles,
  UpdateVehicleDTO,
  UpdateVehicleMileageDTO,
  Vehicle,
} from "../types/vehicle.types";
import { MgUpdateVehicleOilChangeDTO } from "../types/mg.types";

export const VehicleAPI = {
  async list(params?: ListVehiclesQuery): Promise<PaginatedVehicles> {
    const res = await vehicles.get("/vehicles", { params });
    return res.data;
  },

  async getMyVehicles() {
    const res = await vehicles.get("/vehicles/my");
    return res.data;
  },

  async listAllActive(): Promise<Vehicle[]> {
    // helper si tu veux une simple liste sans pagination
    const res = await vehicles.get("/vehicles", {
      params: { status: "ACTIVE", limit: 1000 },
    });
    return res.data.items;
  },

  async getById(id: string): Promise<Vehicle> {
    const res = await vehicles.get(`/vehicles/${id}`);
    return res.data;
  },

  async create(payload: CreateVehicleDTO): Promise<Vehicle> {
    const res = await vehicles.post("/vehicles", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateVehicleDTO): Promise<Vehicle> {
    const res = await vehicles.patch(`/vehicles/${id}`, payload);
    return res.data;
  },

  async updateMileage(
    id: string,
    payload: UpdateVehicleMileageDTO
  ): Promise<Vehicle> {
    const res = await vehicles.patch(`/vehicles/${id}/mileage`, payload);
    return res.data;
  },

  async softDelete(id: string): Promise<void> {
    await vehicles.delete(`/vehicles/${id}`);
  },

  // MG-specific API calls
  async getMgTable() {
    const res = await vehicles.get("/vehicles/mg-table");
    return res.data;
  },

  async updateMgMileage(
    vehicleId: string,
    payload: MgUpdateVehicleOilChangeDTO
  ) {
    const res = await vehicles.post(
      `/vehicles/${vehicleId}/mg/oil-change/complete`,
      payload
    );

    return res.data;
  },

  async mgCreateVehicle(payload: any) {
    const res = await vehicles.post("/vehicles/mg/create", payload);
    return res.data;
  },
};
