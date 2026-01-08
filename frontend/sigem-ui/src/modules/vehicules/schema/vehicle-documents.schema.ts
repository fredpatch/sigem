// src/features/vehicles/schema/vehicle-document.schema.ts
import { z } from "zod";
import { VehicleDocumentType } from "../types/vehicle-document.types";

export const vehicleDocumentFormSchema = z.object({
  type: z.nativeEnum(VehicleDocumentType),
  reference: z
    .string()
    .trim()
    .max(200, "Référence trop longue")
    .optional()
    .or(z.literal("")),
  issuedAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : undefined)),
  expiresAt: z
    .string()
    .min(1, "La date d'expiration est obligatoire")
    .transform((val) => val),
  reminderDaysBefore: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      if (!val) return [30, 15, 7];
      return val
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => Number(p))
        .filter((n) => !Number.isNaN(n) && n >= 0);
    }),
});

export type VehicleDocumentFormValues = z.infer<
  typeof vehicleDocumentFormSchema
>;
