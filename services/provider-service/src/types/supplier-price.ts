export interface SupplierPrice {
  _id: string;
  supplierId: string; // ref Provider
  itemId: string; // ref SupplyItem
  unitPrice: number; // XAF
  currency: "XAF";
  updatedAt: string;
  createdAt: string;

  source?: {
    docId?: string; // future: uploadId
    note?: string; // "Tableau prix 2025"
  };
}
