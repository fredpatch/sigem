import { z } from "zod";

export const ProductTypeEnum = z.enum(["CONSUMABLE", "MOBILIER", "EQUIPEMENT"]);

export const productDefaultValues = {
  label: "",
  type: "CONSUMABLE" as const,
  unit: "",
  tags: [] as string[],
};

export const ProductCreateSchema = z.object({
  label: z.string().min(2, "Libellé requis"),
  type: ProductTypeEnum,
  unit: z.string().trim().optional(),
  tags: z.array(z.string()).default([]),
});

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
