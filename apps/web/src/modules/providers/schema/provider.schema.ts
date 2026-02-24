import { z } from "zod";

export const ProviderTypeEnum = z.enum(["FOURNISSEUR", "PRESTATAIRE"]);

const nonEmptyTrimmed = z.string().trim().min(1, "Champ requis");

// On autorise empty string -> undefined (pratique pour inputs)
const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined));

const stringArray = z
  .array(z.string().trim())
  .optional()
  .default([])
  .transform((arr) => arr.map((x) => x.trim()).filter(Boolean));

export const ProviderCreateSchema = z.object({
  name: nonEmptyTrimmed.min(2, "Nom trop court"),
  designation: nonEmptyTrimmed.min(2, "Désignation trop courte"),

  type: ProviderTypeEnum.optional().default("PRESTATAIRE"),

  // pour MVP: on capture en textarea (une ligne = une valeur),
  // puis on convertit en array au submit (voir form)
  phones: stringArray,
  emails: stringArray,

  website: optionalString
    .refine(
      (v) => !v || /^https?:\/\//i.test(v),
      "URL doit commencer par http(s)://"
    )
    .optional(),

  notes: optionalString,
  tags: stringArray.transform((t) => t.map((x) => x.toLowerCase())),
  dept: optionalString,
  isActive: z.boolean().optional().default(true),
});

export const ProviderUpdateSchema = ProviderCreateSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "Aucun champ à mettre à jour" }
);

export type ProviderCreateInput = z.infer<typeof ProviderCreateSchema>;
export type ProviderUpdateInput = z.infer<typeof ProviderUpdateSchema>;

export const providerDefaultValues: ProviderCreateInput = {
  name: "",
  designation: "",
  type: "PRESTATAIRE",
  phones: [],
  emails: [],
  website: undefined,
  notes: undefined,
  tags: [],
  dept: undefined,
  isActive: true,
};
