import { api } from "@/lib/axios";
import {
  VehicleDocument,
  VehicleDocumentType,
} from "../types/vehicle-document.types";

export interface CreateVehicleDocumentDto {
  vehicleId: string;
  type: VehicleDocumentType;
  reference?: string | null;
  issuedAt?: string | null;
  expiresAt: string;
  reminderDaysBefore?: number[];
}

export interface UpdateVehicleDocumentDto {
  reference?: string | null;
  issuedAt?: string | null;
  expiresAt?: string;
  reminderDaysBefore?: number[];
}

class VehicleDocumentsAPI {
  async list(vehicleId: string): Promise<VehicleDocument[]> {
    const { data } = await api.get(`/vehicle-documents/${vehicleId}/documents`);

    // console.log(data);

    return data;
  }

  async listAll() {
    const { data } = await api.get("/vehicle-documents");

    // console.log("VEHICLE DOCUMENT INFORMATIONS", data);

    return data;
  }

  async listById(id: string): Promise<VehicleDocument> {
    const { data } = await api.get(`/vehicle-documents/documents/${id}`);

    console.log(data);

    return data;
  }

  async create(payload: CreateVehicleDocumentDto): Promise<VehicleDocument> {
    const { vehicleId, ...body } = payload;
    const { data } = await api.post<VehicleDocument>(
      `/vehicle-documents/${vehicleId}/documents`,
      body
    );
    return data;
  }

  async update(
    id: string,
    payload: UpdateVehicleDocumentDto
  ): Promise<VehicleDocument> {
    const { data } = await api.patch<VehicleDocument>(
      `/vehicle-documents/documents/${id}`,
      payload
    );
    return data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/vehicle-documents/documents/${id}`);
  }
}

export const vehicleDocumentsAPI = new VehicleDocumentsAPI();
