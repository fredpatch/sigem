import z from "zod";

export const VEHICLE_TASK_TYPES = [
  "OIL_CHANGE",
  "MAINTENANCE",
  "DOCUMENT_RENEWAL",
  "OTHER",
] as const;

export const VEHICLE_TASK_TRIGGER_TYPES = [
  "BY_DATE",
  "BY_MILEAGE",
  "BY_DATE_OR_MILEAGE",
] as const;

export const VEHICLE_TASK_SEVERITY = ["info", "warning", "critical"] as const;

// À adapter à ton enum côté VehicleDocument si besoin
export const VEHICLE_DOCUMENT_TYPES = [
  "INSURANCE",
  "PARKING_CARD",
  "EXTINGUISHER_CARD",
  "TECH_INSPECTION",
  "OTHER",
] as const;

export const VehicleTaskTemplateBaseSchema = z.object({
  dept: z.string().min(1, "Département requis").default("MG"),

  label: z.string().min(1, "Libellé requis"),
  description: z.string().optional().nullable(),

  type: z.enum(VEHICLE_TASK_TYPES, {
    errorMap: () => ({ message: "Type de tâche requis" }),
  }),
  triggerType: z.enum(VEHICLE_TASK_TRIGGER_TYPES, {
    errorMap: () => ({ message: "Déclencheur requis" }),
  }),

  everyKm: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (typeof val === "number" && Number.isNaN(val)) return null;
    return val;
  }, z.number().int().positive().nullable().optional()),

  everyMonths: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (typeof val === "number" && Number.isNaN(val)) return null;
    return val;
  }, z.number().int().positive().nullable().optional()),

  noticeKmBefore: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (typeof val === "number" && Number.isNaN(val)) return null;
    return val;
  }, z.number().int().nonnegative().nullable().optional()),

  noticeDaysBefore: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (typeof val === "number" && Number.isNaN(val)) return null;
    return val;
  }, z.number().int().nonnegative().nullable().optional()),

  defaultSeverity: z.enum(VEHICLE_TASK_SEVERITY).default("warning"),

  requiresDocument: z.boolean().default(false),

  // 🆕 documentType aligné avec le backend
  documentType: z.enum(VEHICLE_DOCUMENT_TYPES).optional().nullable(),

  active: z.boolean().default(true),
});

export const VehicleTaskTemplateCreateSchema =
  VehicleTaskTemplateBaseSchema.superRefine((val, ctx) => {
    // au moins une récurrence si c’est censé être répétitif
    if (!val.everyKm && !val.everyMonths) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["everyMonths"],
        message: "Définissez au moins une récurrence (km ou mois)",
      });
    }

    // si lié à un document → type de document requis
    if (val.requiresDocument && !val.documentType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentType"],
        message: "Type de document requis pour un modèle lié à un document",
      });
    }
  });

export const VehicleTaskTemplateUpdateSchema =
  VehicleTaskTemplateBaseSchema.partial().extend({
    id: z.string().min(1, "Id requis"),
  });

export type VehicleTaskTemplateCreateFormValues = z.infer<
  typeof VehicleTaskTemplateCreateSchema
>;
export type VehicleTaskTemplateUpdateFormValues = z.infer<
  typeof VehicleTaskTemplateUpdateSchema
>;
