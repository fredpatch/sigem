// src/features/vehicles/schemas/vehicle-document.schema.ts
import * as z from "zod";

export const vehicleDocumentFormSchema = z.object({
  reference: z.string().trim().optional(),
  provider: z.string().trim().optional(), // insurance only
  issuedAt: z.string().optional(), // YYYY-MM-DD
  expiresAt: z.string().min(1, "Date d'expiration obligatoire"),
});

export type VehicleDocumentFormValues = z.infer<
  typeof vehicleDocumentFormSchema
>;
