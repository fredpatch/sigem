export type ProductType = "CONSUMABLE" | "MOBILIER" | "EQUIPEMENT" | "AUTRE";

export interface Product {
  id: string;
  label: string;
  code: string;
  type: ProductType;
  unit?: string;
  tags: string[];
  dept?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface Purchase {
  id: string;
  providerId: any; // populated or string id (UI can handle both)
  date: string;
  reference?: string;
  status: PurchaseStatus;
  currency: string;
  dept?: string;
  notes?: string;
  tags: string[];
  subtotal: number;
  total: number;
  tax?: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseLine {
  id: string;
  purchaseId: string;
  productId: string;

  labelSnapshot: string;
  codeSnapshot: string;
  typeSnapshot: ProductType;
  unitSnapshot?: string;

  unitPrice: number;
  quantity: number;
  lineTotal: number;
  notes?: string;
}

export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ORDERED"
  | "RECEIVED"
  | "CANCELLED"
  | "CONVERTED"; // si tu ajoutes ce statut (recommandé)

export interface PurchaseRequest {
  id: string;
  title: string;
  reference?: string;
  dept?: string;
  providerId?: any;
  neededAt?: string;
  notes?: string;
  tags: string[];
  currency: string;
  subtotalEstimated: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  // purchaseId?: string; (si status CONVERTED)
}

export interface PurchaseRequestLine {
  id: string;
  requestId: string;
  productId: string;

  labelSnapshot: string;
  codeSnapshot: string;
  typeSnapshot: ProductType;
  unitSnapshot?: string;

  quantity: number;
  unitPriceEstimated?: number;
  lineTotalEstimated: number;
  notes?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ProviderCatalogItem {
  productId: string;
  label: string;
  code: string;
  type: ProductType;
  unit?: string;
  last: {
    unitPrice: number;
    quantity: number;
    date: string;
    purchaseId: string;
  };
  stats: { min: number; avg: number; max: number; count: number };
}

export interface ProductPriceCompareItem {
  provider: { id: string; name: string; designation: string; type: string };
  product: { label: string; code: string; type: ProductType; unit?: string };
  last: { unitPrice: number; date: string; purchaseId: string };
  stats: { min: number; avg: number; max: number; count: number };
}
