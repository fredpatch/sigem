// vehicle-task.schemas.ts
import * as z from "zod";

export const optionalDateSchema = z.preprocess((raw) => {
  if (raw === "" || raw === null || raw === undefined) {
    return undefined; // on traitera l'absence de date comme "non fournie"
  }

  // Si c'est un Date → on le convertit en string ISO "YYYY-MM-DD"
  if (raw instanceof Date) {
    return raw.toISOString().slice(0, 10);
  }

  if (typeof raw === "string") {
    // Si tu veux vraiment virer les chaînes vides :
    if (raw.trim() === "") return undefined;
    return raw; // on laisse tel quel, validation plus bas
  }

  // Autre type exotique → on ignore
  return undefined;
}, z.string().optional());

export const optionalMileageSchema = z.preprocess((raw) => {
  // RHF + valueAsNumber: champ vide -> NaN
  if (raw === "" || raw === null || raw === undefined) return undefined;
  if (typeof raw === "number" && Number.isNaN(raw)) return undefined;

  // si tu reçois une string (au cas où) ->
  if (typeof raw === "string") {
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }

  return raw;
}, z.number().int().nonnegative().optional());

export const VehicleTaskBaseSchema = z.object({
  vehicleId: z.string().min(1, "Véhicule requis"),

  vehicleDocumentId: z.string().optional().nullable(),
  documentType: z.string().optional().nullable(),

  dept: z.string().min(1, "Département requis"),

  templateId: z.string().optional().nullable(),

  type: z.string().optional(), // ou enum si tu as déjà
  triggerType: z.string().optional(), // idem

  label: z.string().min(1, "Libellé requis"),
  description: z.string().optional().nullable(),

  dueAt: optionalDateSchema, // éviter les "", // ISO string

  dueMileage: optionalMileageSchema,

  severity: z.enum(["info", "warning", "critical"]).default("warning"),
});

export const VehicleTaskCreateSchema = VehicleTaskBaseSchema.superRefine(
  (data, ctx) => {
    // 1) Cas "lié à un document" → documentType présent => document requis
    if (data.documentType && !data.vehicleDocumentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vehicleDocumentId"],
        message: "Document requis pour ce type de tâche",
      });
    }
    // Si on enlève templateId (ou n'en a pas), et que l'on touche aux champs,
    // on peut forcer type + triggerType si nécessaires
    if (!data.templateId) {
      if (!data.type && !data.triggerType && !data.label) {
        // on peut laisser passer si on ne touche à rien
        return;
      }

      if (!data.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["type"],
          message: "Type de tâche requis en mode manuel",
        });
      }
      if (!data.triggerType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["triggerType"],
          message: "Déclencheur requis en mode manuel",
        });
      }
    }
  }
);

export const VehicleTaskUpdateSchema = VehicleTaskBaseSchema.partial().extend({
  id: z.string().min(1),
});

export type VehicleTaskCreateFormValues = z.infer<
  typeof VehicleTaskCreateSchema
>;
export type VehicleTaskUpdateFormValues = z.infer<
  typeof VehicleTaskUpdateSchema
>;
