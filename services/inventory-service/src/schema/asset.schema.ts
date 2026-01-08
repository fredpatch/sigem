import { z } from "zod";

export const CreateSchema = z.object({
  code: z.string().min(1).max(64).trim().optional(), // ex: "IAC-001" ou "E-A-IAC-001" selon ton canon
  label: z.string().min(1).trim(),
  categoryId: z.string().min(1),
  locationId: z.string().min(1),
  serialNumber: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional(),
  situation: z
    .enum(["NEUF", "EN_SERVICE", "EN_PANNE", "HORS_SERVICE", "REFORME"])
    .optional(),
  observation: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

export const UpdateSchema = CreateSchema.partial();

export const ListQuery = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  situation: z
    .enum(["NEUF", "EN_SERVICE", "EN_PANNE", "HORS_SERVICE", "REFORME"])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  includeDeleted: z.coerce.boolean().optional(),
});
