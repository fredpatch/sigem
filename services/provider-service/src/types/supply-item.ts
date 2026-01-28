export type SupplyUnit = "UNIT" | "PACK" | "BOX" | "CARTON" | "BOTTLE" | "REAM";

export interface SupplyItem {
  label: string; // "Rame papier A4 80g"
  labelNormalized: string;
  unit?: SupplyUnit; // optionnel
  active: boolean; // default true
  createdAt: string;
  updatedAt: string;
}
