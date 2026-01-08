import { z } from "zod";

export const AssetSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1),
  label: z.string().min(1),
  category: z.enum(["EQUIP", "INFO", "MOBILIER", "VEHICLE"]),
  location: z.string().optional(),
  status: z.enum(["ACTIVE", "REPAIR", "RETIRED"]).optional(),
});

export type AssetInput = z.infer<typeof AssetSchema>;
