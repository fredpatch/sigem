// src/modules/locations/schema.ts
import { z } from "zod";

export const LocationLevelEnum = z.enum([
  "BUREAU",
  "DIRECTION",
  "BATIMENT",
  "LOCALISATION",
]);
// tu pourras rajouter plus tard: ["REGION", "BATIMENT", "DIRECTION", "BUREAU"]

export const LocationBaseSchema = z.object({
  localisation: z.string().min(2, "Localisation required"), // ex: ESTUAIRE
  batiment: z.string().min(1, "Bâtiment required"), // ex: A
  direction: z.string().min(2, "Direction required"), // ex: DAF
  bureau: z.string().min(2, "Bureau required"), // ex: Pool chargé d'étude
  level: LocationLevelEnum.default("BUREAU").optional(),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const LocationCreateSchema = LocationBaseSchema;

export const LocationUpdateSchema = LocationBaseSchema.extend({
  id: z.string().min(1),
});

export type LocationCreateInput = z.infer<typeof LocationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof LocationUpdateSchema>;
