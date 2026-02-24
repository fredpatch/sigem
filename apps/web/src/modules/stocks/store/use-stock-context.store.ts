// src/features/stock/store/use-stock-context.store.ts
import { create } from "zustand";

export const useStockContextStore = create<{
  locationId?: string;
  setLocationId: (id: string) => void;
}>((set) => ({
  locationId: undefined,
  setLocationId: (id) => set({ locationId: id }),
}));
