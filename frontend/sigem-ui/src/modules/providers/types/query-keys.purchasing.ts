export const qk = {
  products: (params?: unknown) => ["products", params] as const,
  product: (id: string) => ["products", id] as const,

  purchases: (params?: unknown) => ["purchases", params] as const,
  purchase: (id: string) => ["purchases", id] as const,

  requests: (params?: unknown) => ["purchase-requests", params] as const,
  request: (id: string) => ["purchase-requests", id] as const,

  providerCatalog: (providerId: string, params?: unknown) =>
    ["providers", providerId, "catalog", params] as const,

  productPriceCompare: (productId: string, params?: unknown) =>
    ["products", productId, "price-compare", params] as const,
};
