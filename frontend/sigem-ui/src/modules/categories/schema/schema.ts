import { z } from "zod";

export const CategoryFamilyEnum = z.enum([
  "EQUIPEMENT",
  "INFORMATIQUE",
  "MOBILIER",
]);

export const CategoryCreateSchema = z.object({
  label: z.string().min(2, "Label required"),
  family: CategoryFamilyEnum.optional(), // root categories
  parentId: z.string().optional().nullable(), // subcategories
  description: z.string().max(300).optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.extend({
  id: z.string().min(1),
});

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
