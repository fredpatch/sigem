import { z } from "zod";

export const objectIdSchema = z
  .string()
  .min(1)
  .refine((v) => /^[a-fA-F0-9]{24}$/.test(v), "Invalid ObjectId");

export const supplyUnitSchema = z.enum([
  "UNIT",
  "PACK",
  "BOX",
  "CARTON",
  "BOTTLE",
  "REAM",
]);

export const supplyPlanStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "WAITING_QUOTE",
  "WAITING_INVOICE",
  "ORDERED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
]);

export const createSupplyItemDTO = z.object({
  label: z.string().min(2),
  unit: supplyUnitSchema.optional().nullable(),
  active: z.boolean().optional(),
});

export const updateSupplyItemDTO = z.object({
  label: z.string().min(2).optional(),
  unit: supplyUnitSchema.optional().nullable(),
  active: z.boolean().optional(),
});

export const upsertSupplierPriceDTO = z.object({
  supplierId: objectIdSchema,
  itemId: objectIdSchema,
  unitPrice: z.number().min(0),
  currency: z.literal("XAF").optional(),
  source: z
    .object({
      docId: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
});

export const supplyPlanLineInputDTO = z.object({
  itemId: objectIdSchema,
  labelSnapshot: z.string().min(1),
  unitSnapshot: z.string().optional().nullable(),
  quantity: z.number().min(0),

  selectedSupplierId: objectIdSchema.optional().nullable(),
  selectedUnitPrice: z.number().min(0).optional().nullable(),
});

export const createSupplyPlanDTO = z.object({
  scheduledFor: z.coerce.date().optional().nullable(),
  department: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lines: z.array(supplyPlanLineInputDTO).default([]),
});

export const updateSupplyPlanDTO = z.object({
  scheduledFor: z.coerce.date().optional().nullable(),
  department: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lines: z.array(supplyPlanLineInputDTO).optional(),
});

export const changeSupplyPlanStatusDTO = z.object({
  to: supplyPlanStatusSchema,
  note: z.string().optional(),
});
