import { api } from "@/lib/axios";
import { StockItemDto, StockMovementDto } from "../types/types";

export async function initDefaultLocation() {
  const { data } = await api.post("/stocks/locations/init");
  return data as { _id: string; name: string };
}

export async function getStockLocations() {
  const { data } = await api.get("/stocks/locations");
  return data as { _id: string; name: string }[];
}

export async function getStock(params: {
  locationId: string;
  search?: string;
  belowMin?: boolean;
  limit?: number;
}) {
  const { data } = await api.get("/stocks", { params });

  return data as { items: StockItemDto[]; total: number; success: boolean };
}

export async function getStockMovements(params: {
  locationId?: string;
  supplyItemId?: string;
  type?: "IN" | "OUT" | "ADJUST";
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get("/stocks/movements", { params });
  // console.log("getStock params", params);
  // console.log("getStock data", data);
  return data as {
    items: StockMovementDto[];
    page: number;
    limit: number;
    total: number;
    pages: number;
    success: boolean;
  };
}

export async function createStockMovement(input: {
  type: "IN" | "OUT" | "ADJUST";
  supplyItemId: string;
  locationId: string;
  qty?: number;
  countedQty?: number;
  providerId?: string;
  unitCost?: number;
  reason?: string;
}) {
  const { data } = await api.post("/stocks/movements", input);
  return data;
}

export async function lookupSupplierPrice(params: {
  supplierId: string;
  itemId: string;
}) {
  const { data } = await api.get("/stocks/supplier-prices/lookup", { params });
  // console.log("lookupSupplierPrice params", params);
  // console.log("lookupSupplierPrice data", data);
  return data as
    | { success: true; found: false }
    | { success: true; found: true; unitPrice: number; currency: string };
}

export async function getStockKpis(locationId: string) {
  const { data } = await api.get("/stocks/kpis", { params: { locationId } });
  return data as {
    success: boolean;
    data: {
      totalItems: number;
      totalQuantity: number;
      belowMinCount: number;
      lastMovementAt: string | null;
      lastMovements: any | null;
    };
  };
}

export async function setStockMinLevel(input: {
  locationId: string;
  supplyItemId: string;
  minLevel: number;
}) {
  const { data } = await api.patch("/stocks/min-level", input);
  return data;
}
