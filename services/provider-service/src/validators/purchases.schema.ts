import { z } from "zod";

export const PurchaseStatusEnum = z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]);

export const purchaseLineInputSchema = z.object({
  productId: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const createPurchaseSchema = z.object({
  providerId: z.string().min(1),
  date: z.coerce.date(),
  reference: z.string().optional(),
  status: PurchaseStatusEnum.optional(),

  currency: z.string().default("XAF"),
  dept: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),

  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),

  lines: z.array(purchaseLineInputSchema).min(1),
});

export const updatePurchaseSchema = z.object({
  date: z.coerce.date().optional(),
  reference: z.string().optional(),
  dept: z.string().optional(),
  status: PurchaseStatusEnum.optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
});

export const listPurchasesQuerySchema = z.object({
  q: z.string().optional(),
  providerId: z.string().optional(),
  dept: z.string().optional(),
  status: PurchaseStatusEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
