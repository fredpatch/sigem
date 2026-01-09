import { z } from "zod";

export const PurchaseRequestStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "ORDERED",
  "RECEIVED",
  "CANCELLED",
  "CONVERTED",
]);

export const requestLineInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().nonnegative(),
  unitPriceEstimated: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const createPurchaseRequestSchema = z.object({
  title: z.string().min(2),
  reference: z.string().optional(),
  dept: z.string().optional(),
  providerId: z.string().optional(), // fournisseur pressenti
  neededAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  currency: z.string().default("XAF"),
  lines: z.array(requestLineInputSchema).min(1),
});

export const updatePurchaseRequestSchema = createPurchaseRequestSchema
  .omit({ lines: true })
  .partial();

export const updatePurchaseRequestLinesSchema = z.object({
  lines: z.array(requestLineInputSchema).min(1),
});

export const listPurchaseRequestsQuerySchema = z.object({
  q: z.string().optional(),
  dept: z.string().optional(),
  providerId: z.string().optional(),
  status: PurchaseRequestStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// action transitions
export const transitionSchema = z.object({
  action: z.enum(["submit", "approve", "reject", "order", "receive", "cancel"]),
});
