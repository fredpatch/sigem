export type SupplyPlanRow = {
  _id: string;
  reference: string;
  status: any;
  createdAt?: string;
  estimatedTotal?: number;
  currency?: string;
  lines?: any[];
};
