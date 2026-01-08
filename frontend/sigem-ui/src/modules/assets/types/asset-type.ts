export type AssetSituation =
  | "NEUF"
  | "EN_SERVICE"
  | "EN_PANNE"
  | "HORS_SERVICE"
  | "REFORME";

export type FamilyType = "EQUIPEMENT" | "INFORMATIQUE" | "MOBILIER";

export const CategoryFamilyLabels: Record<FamilyType, string> = {
  EQUIPEMENT: "Équipement",
  INFORMATIQUE: "Informatique",
  MOBILIER: "Mobilier",
};

export type LevelType = "LOCALISATION" | "BATIMENT" | "DIRECTION" | "BUREAU";

export interface CategoryDTO {
  _id: string;
  code: string;
  label: string;
  family: FamilyType;
  parentId?: string | null;
  canonicalPrefix: string;
  description?: string;
  allowedChildren?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationDTO {
  _id: string;
  localisation: string;
  batiment: string;
  direction: string;
  bureau: string;
  code: string; // ESTUAIRE-A-DG-PCE
  path: string; // ESTUAIRE/A/DG/Pool Charge d’étude
  level: LevelType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- MAIN ASSET DTO ---
export interface AssetDTO {
  _id: string;

  // Identification
  code: string; // Auto-generated: prefix + sequence
  label: string;
  prefix: string;
  sequence: number;

  // Relations
  categoryId: CategoryDTO;
  locationId: LocationDTO;

  // When backend populates:
  category?: CategoryDTO;
  location?: LocationDTO;

  // Metadata
  serialNumber?: string;
  brand?: string;
  model?: string;
  quantity: number;
  unit: string;

  // State
  situation: AssetSituation;
  observation?: string;

  // Extensible fields (RAM, CPU…)
  attributes?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAssetsDTO {
  data: AssetDTO[];
  total: number;
  page: number;
  limit: number;
}
