import * as z from "zod";

export const vehicleFormSchema = z.object({
  // --- IDENTITÉ DE BASE ---
  plateNumber: z
    .string()
    .min(1, "L'immatriculation est obligatoire")
    .max(50, "Trop long"),
  brand: z.string().min(1, "La marque est obligatoire").max(100, "Trop long"),
  model: z.string().min(1, "Le modèle est obligatoire").max(100, "Trop long"),

  type: z.string().optional().nullable(), // Berline, 4x4...
  year: z
    .union([
      z
        .string()
        .trim()
        .regex(/^\d{4}$/, "Année invalide")
        .transform((val) => Number(val)),
      z.number(),
    ])
    .optional()
    .nullable(),

  fiscalPower: z
    .number({ invalid_type_error: "La puissance fiscale doit être un nombre" })
    .min(0, "La puissance fiscale ne peut pas être négative")
    .optional()
    .nullable(),

  // --- USAGE & ÉNERGIE ---
  usageType: z
    .enum(["SERVICE", "FONCTION", "PICKUP", "SUV", "OTHER"])
    .optional()
    .nullable(),
  energy: z
    .enum(["ESSENCE", "DIESEL", "HYBRIDE", "ELECTRIQUE", "OTHER"])
    .optional()
    .nullable(),

  // --- DATES ADMINISTRATIVES ---
  acquisitionDate: z.string().optional().nullable(), // "yyyy-MM-dd"
  firstRegistrationDate: z.string().optional().nullable(), // "yyyy-MM-dd"

  // --- PROPRIÉTÉ ---
  ownership: z.string().optional().nullable().default("ANAC"), // ex. "ANAC"

  // --- COMPTEUR KM ---
  currentMileage: z
    .number({ invalid_type_error: "Le kilométrage doit être un nombre" })
    .nonnegative("Le kilométrage ne peut pas être négatif"),

  // --- AFFECTATION ---
  assignedToEmployeeMatricule: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => (v === null || v === undefined ? v : String(v).trim()))
    .refine((v) => v === null || v === undefined || v.length > 0, {
      message: "Matricule invalide",
    }),

  assignedToName: z.string().optional().nullable(),
  assignedToDirection: z.string().optional().nullable(),
  assignedToFunction: z.string().optional().nullable(),

  // --- STATUT & NOTES ---
  status: z
    .enum(["ACTIVE", "IN_MAINTENANCE", "INACTIVE", "RETIRED"])
    .default("ACTIVE"),

  maintenanceNotes: z.string().optional().nullable(),
});

export const VehicleUpdateSchema = vehicleFormSchema.partial().extend({
  id: z.string().min(1, "Vehicle Id required"),
});

export type VehicleCreateFormValues = z.infer<typeof vehicleFormSchema>;
export type VehicleUpdateFormValues = z.infer<typeof vehicleFormSchema>;
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const defaultValues = {
  plateNumber: "",
  brand: "",
  model: "",
  type: "",
  year: null,
  fiscalPower: null,

  usageType: "SERVICE",
  energy: "ESSENCE",

  acquisitionDate: "",
  firstRegistrationDate: "",
  ownership: "ANAC",
  currentMileage: 0,

  assignedToEmployeeMatricule: undefined,
  assignedToName: "",
  assignedToDirection: "",
  assignedToFunction: "",

  status: "ACTIVE",

  maintenanceNotes: "",
};
