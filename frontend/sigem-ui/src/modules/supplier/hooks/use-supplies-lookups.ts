import { useMemo } from "react";
import { useSupplyItems } from "./supplies.queries";
import { useProvidersList } from "@/modules/providers/hooks/use-providers";

export function useSuppliesLookups() {
  const itemsQ = useSupplyItems("");
  const providersQ = useProvidersList({
    page: 1,
    limit: 100,
    search: "",
    isActive: true,
  } as any);

  const items = useMemo(() => {
    const arr = (itemsQ.data?.items ??
      itemsQ.data?.data?.items ??
      itemsQ.data?.items?.items ??
      []) as any[];
    return arr;
  }, [itemsQ.data]);

  const providers = useMemo(() => {
    const arr = (providersQ.data?.items ??
      (providersQ.data as any)?.data?.items ??
      (providersQ.data as any)?.items ??
      []) as any[];
    return arr;
  }, [providersQ.data]);

  const itemMap = useMemo(() => {
    const m = new Map<string, any>();
    items.forEach((it) => m.set(String(it._id), it));
    return m;
  }, [items]);

  const providerMap = useMemo(() => {
    const m = new Map<string, any>();
    providers.forEach((p) => m.set(String(p.id), p));
    return m;
  }, [providers]);

  return {
    itemsQ,
    providersQ,
    itemMap,
    providerMap,
  };
}
