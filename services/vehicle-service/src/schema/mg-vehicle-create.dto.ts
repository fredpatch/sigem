import { z } from "zod";
import { VehicleDocumentType } from "src/types/vehicle-document.type";

const DocSchema = z.object({
  reference: z.string().trim().optional(),
  provider: z.string().trim().optional(), // assurance mainly
  issuedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
  everyMonths: z.number().min(1).optional(), // optional override
});

export const MgCreateVehicleSchema = z.object({
  vehicle: z.object({
    plateNumber: z.string().trim().min(3),
    brand: z.string().trim().min(1),
    model: z.string().trim().min(1),
    type: z.string().trim().optional(),
    year: z.number().optional(),

    usageType: z.string().optional(),
    energy: z.string().optional(),
    fiscalPower: z.number().optional(),

    acquisitionDate: z.coerce.date().optional(),
    firstRegistrationDate: z.coerce.date().optional(),
    ownership: z.string().trim().optional(),

    currentMileage: z.number().min(0).optional(),
    mileageUpdatedAt: z.coerce.date().optional(),

    assignedToEmployeeMatricule: z.string().trim().optional(),
    assignedToName: z.string().trim().optional(),
    assignedToDirection: z.string().trim().optional(),
    assignedToFunction: z.string().trim().optional(),

    maintenanceNotes: z.string().trim().optional(),
  }),

  documents: z
    .object({
      insurance: DocSchema.optional(),
      techInspection: DocSchema.optional(),
      extinguisher: DocSchema.optional(),
      parkingCard: DocSchema.optional(),
    })
    .optional(),
});

export type MgCreateVehicleDTO = z.infer<typeof MgCreateVehicleSchema>;

// helper mapping keys => VehicleDocumentType
export const DOC_KEY_TO_TYPE = {
  insurance: VehicleDocumentType.INSURANCE,
  techInspection: VehicleDocumentType.TECH_INSPECTION,
  extinguisher: VehicleDocumentType.EXTINGUISHER_CARD,
  parkingCard: VehicleDocumentType.PARKING_CARD,
} as const;
