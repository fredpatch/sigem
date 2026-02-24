export type SupplyPlanRow = {
  _id: string;
  reference: string;
  status: any;
  createdAt?: string;
  estimatedTotal?: number;
  currency?: string;
  lines?: any[];
};

export type SupplierPriceRow = {
  id: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemLabel: string;
  unitPrice: number;
  updatedAt?: string;
};

export type SupplySideKpisDto = {
  plans: {
    activeCount: number;
    activeLinesCount: number;
    linesMissingPrice: number;
    byStatus: Record<string, number>;
  };
  prices: {
    coveragePct: number; // 0..100
    missingItemsCount: number; // items actifs sans prix
    stalePricesCount: number; // prix > 30 jours
    lastUpdateAt: string | null;
  };
  top: {
    items: Array<{ itemId: string; label: string; count: number }>;
    suppliers: Array<{ supplierId: string; name: string; count: number }>;
  };
};

export interface SupplyDashboardKpis {
  plans: {
    total: number;
    activeCount: number;
    activeLinesCount: number;
    linesMissingPrice: number;
    byStatus: Record<string, number>;
  };

  prices: {
    totalPrices: number;
    itemsWithPrice: number;
    totalItems: number;
    coveragePct: number;
    stalePricesCount: number;
    missingItemsCount: number;
    lastUpdateAt?: Date;
  };

  top: {
    items: Array<{ itemId: string; label: string; count: number }>;
    suppliers: Array<{ supplierId: string; name: string; count: number }>;
  };
}
