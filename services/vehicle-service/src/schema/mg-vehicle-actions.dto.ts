import { z } from "zod";

export const MgCompleteOilChangeSchema = z.object({
  completedMileage: z.number().min(0),
  completedAt: z.coerce.date().optional(),
  completionComment: z.string().trim().optional(),
});

export type MgCompleteOilChangeDTO = z.infer<typeof MgCompleteOilChangeSchema>;
