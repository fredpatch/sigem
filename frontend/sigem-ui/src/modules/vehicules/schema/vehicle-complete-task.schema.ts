// src/features/vehicles/schema/vehicle-task-complete.schema.ts
import { z } from "zod";
import {
  optionalDateSchema,
  optionalMileageSchema,
} from "./vehicle-task.schemas";

export const vehicleTaskCompleteSchema = z.object({
  completedAt: optionalDateSchema,
  completedMileage: optionalMileageSchema,
  completionComment: z
    .string()
    .max(1000, "Le commentaire est trop long.")
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val : undefined)),
});

export type VehicleTaskCompleteFormValues = z.infer<
  typeof vehicleTaskCompleteSchema
>;
