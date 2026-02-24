import { z } from "zod";

export const AssetSituationEnum = z.enum([
  "NEUF",
  "EN_SERVICE",
  "EN_PANNE",
  "HORS_SERVICE",
]);

// Base fields common to create & update
export const AssetBaseSchema = z.object({
  label: z.string().min(1, "Libellé requis"),

  categoryId: z.string().min(1, "Catégorie obligatoire"),
  locationId: z.string().min(1, "Localisation obligatoire"),

  // optional metadata
  serialNumber: z.string().optional().or(z.literal("")),
  brand: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  quantity: z.number().int().positive().default(1),
  unit: z.string().default("pcs"),

  // optional for UX but not required
  situation: AssetSituationEnum.default("EN_SERVICE"),
  observation: z.string().optional().or(z.literal("")),

  // attributes (RAM, CPU…)
  attributes: z.record(z.any()).optional(), // key/value

  notes: z
    .string()
    .max(2000, "Notes trop longues")
    .optional()
    .or(z.literal("")),
});

// ➕ Create = tous les champs requis / optionnels pour un nouvel asset
export const AssetCreateSchema = AssetBaseSchema;

// 🔁 Update = tous les champs optionnels, mais id requis
export const AssetUpdateSchema = AssetBaseSchema.partial().extend({
  _id: z.string().min(1, "Identifiant requis"),
});

// Types TS pratiques
export type AssetCreateInput = z.infer<typeof AssetCreateSchema>;
export type AssetUpdateInput = z.infer<typeof AssetUpdateSchema>;

// 🌱 Valeurs par défaut pour le formulaire de création
export const assetDefaultValues: AssetCreateInput = {
  label: "",
  categoryId: "",
  locationId: "",
  serialNumber: "",
  brand: "",
  model: "",
  quantity: 1,
  unit: "pcs",
  situation: "EN_SERVICE",
  observation: "",
  attributes: {}, // vide par défaut
};
