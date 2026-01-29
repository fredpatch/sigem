import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(3, "Numéro trop court")
  .max(30, "Numéro trop long");

const emailSchema = z.string().trim().toLowerCase().email("Email invalide");

const websiteSchema = z
  .string()
  .trim()
  .url("URL invalide")
  .optional()
  .or(z.literal("").transform(() => undefined));

/**
 * Utilitaire: accepte soit un string, soit un tableau,
 * et normalise en string[] propre.
 */
const stringArray = (item: z.ZodTypeAny) =>
  z
    .union([item, z.array(item)])
    .optional()
    .transform((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    })
    .transform((arr) => arr.map((x) => String(x).trim()).filter(Boolean));

export const ProviderTypeSchema = z.enum(["FOURNISSEUR", "PRESTATAIRE"]);

export const CreateProviderSchema = z.object({
  name: z.string().trim().min(2, "Nom requis"),
  designation: z.string().trim().min(2, "Désignation requise"),

  type: ProviderTypeSchema.optional().default("PRESTATAIRE"),

  phones: stringArray(phoneSchema),
  emails: stringArray(emailSchema),

  website: websiteSchema,

  notes: z.string().trim().max(2000).optional(),
  tags: stringArray(z.string().trim().min(1)).transform((t) =>
    t.map((x) => x.toLowerCase()),
  ),

  dept: z.string().trim().optional(),

  isActive: z.boolean().optional().default(true),
});

export const UpdateProviderSchema = CreateProviderSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "Aucun champ à mettre à jour" },
);

export const ProviderIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

/**
 * Query schema pour list/pagination/search
 * Exemple: /v1/providers?search=hotel&active=true&type=PRESTATAIRE&page=1&limit=20
 */
export const ListProvidersQuerySchema = z.object({
  search: z.string().trim().optional(),

  active: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),

  type: ProviderTypeSchema.optional(),

  dept: z.string().trim().optional(),

  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine((n) => Number.isFinite(n) && n >= 1, "page invalide"),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 20))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 300, "limit invalide"),

  sort: z.enum(["name", "createdAt", "updatedAt"]).optional().default("name"),

  order: z.enum(["asc", "desc"]).optional().default("asc"),

  withoutContact: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export const providerCatalogQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(["CONSUMABLE", "MOBILIER", "EQUIPEMENT", "AUTRE"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProviderInput = z.infer<typeof CreateProviderSchema>;
export type UpdateProviderInput = z.infer<typeof UpdateProviderSchema>;
export type ListProvidersQuery = z.infer<typeof ListProvidersQuerySchema>;
