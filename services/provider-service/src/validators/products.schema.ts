import { z } from "zod";

export const ProductTypeEnum = z.enum([
  "CONSUMABLE",
  "MOBILIER",
  "EQUIPEMENT",
  "AUTRE",
]);

export const querySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createProductSchema = z.object({
  label: z.string().min(2),
  // code optionnel: si absent => auto-généré
  code: z.string().min(2).optional(),
  type: ProductTypeEnum,

  //   categoryId: z.string().optional(), // ObjectId string
  unit: z.string().min(1).optional(),
  tags: z.array(z.string()).default([]),

  dept: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  // label et type peuvent être modifiés, mais attention: code reste stable par défaut
});

export const listProductsQuerySchema = z.object({
  q: z.string().optional(), // recherche
  type: ProductTypeEnum.optional(),
  //   categoryId: z.string().optional(),
  dept: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
