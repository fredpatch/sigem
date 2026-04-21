import { api } from "@/lib/axios";
import {
  UpsertVehicleDocumentPayload,
  VehicleDocument,
  VehicleDocumentType,
} from "../types/vehicle-document.types";

export interface CreateVehicleDocumentDto {
  vehicleId: string;
  type: VehicleDocumentType;
  reference?: string | null;
  provider?: string | null;
  issuedAt?: string | null;
  expiresAt: string;
  reminderDaysBefore?: number[];
}

export interface UpdateVehicleDocumentDto {
  reference?: string | null;
  issuedAt?: string | null;
  expiresAt?: string;
  reminderDaysBefore?: number[];
  provider?: string | null;
}

export type VehicleDocumentDashboardKpis = {
  activeVehicles: number;
  totalDocuments: number;
  activeDocsCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  vehiclesWithDocs: number;
  vehiclesWithExpired: number;
  vehiclesMissingRequired: number;
  compliantVehicles: number;
  compliance: number;
  complianceTrend: {
    compliance7dAgo: number;
    compliance30dAgo: number;
    points7d: number;
    points30d: number;
    pct7d: number;
    pct30d: number;
  };
  noReminder: number;
  byType: Record<string, number>;
  typeChartData: Array<{ type: string; count: number }>;
  topUrgentDocs: Array<any>;
};

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

  async getKpis(soonDays = 30): Promise<VehicleDocumentDashboardKpis> {
    const { data } = await api.get("/vehicle-documents/kpis", {
      params: { soonDays },
    });
    return data;
  }

  async listById(id: string): Promise<VehicleDocument> {
    const { data } = await api.get(`/vehicle-documents/documents/${id}`);

    // console.log(data);

    return data;
  }

  async listByVehicle(vehicleId: string) {
    const { data } = await api.get(`/vehicle-documents/${vehicleId}/documents`);
    return data;
  }

  async create(
    vehicleId: string,
    payload: Omit<UpsertVehicleDocumentPayload, "vehicleId">,
  ) {
    const { data } = await api.post(
      `/vehicle-documents/${vehicleId}/documents`,
      payload,
    );
    return data;
  }

  async update(
    docId: string,
    payload: Omit<UpsertVehicleDocumentPayload, "vehicleId">,
  ) {
    const { data } = await api.patch(
      `/vehicle-documents/documents/${docId}`,
      payload,
    );
    return data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/vehicle-documents/documents/${id}`);
  }
}

export const vehicleDocumentsAPI = new VehicleDocumentsAPI();
