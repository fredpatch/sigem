// src/features/vehicles/schemas/vehicle-document.schema.ts
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import * as z from "zod";
import { Vehicle } from "../../types/vehicle.types";
import { VehicleDocumentType } from "../../types/vehicle-document.types";
import { useVehicleDocuments } from "../../hooks/use-vehicle-documents";
import { useMemo } from "react";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { Input } from "@/components/ui/input";
import { ReusableForm } from "@/components/shared/form/form.component";

const toIso = (d?: string) =>
  d ? new Date(`${d}T00:00:00`).toISOString() : undefined;

export const vehicleDocumentFormSchema = z.object({
  reference: z.string().trim().optional(),
  provider: z.string().trim().optional(), // insurance only
  issuedAt: z.string().optional(), // YYYY-MM-DD
  expiresAt: z.string().min(1, "Date d'expiration obligatoire"),
});

export type VehicleDocumentFormValues = z.infer<
  typeof vehicleDocumentFormSchema
>;

const DOC_UI: Record<
  VehicleDocumentType,
  { title: string; showProvider?: boolean; refLabel: string }
> = {
  INSURANCE: {
    title: "Mettre à jour l’assurance",
    showProvider: true,
    refLabel: "Référence / Police (optionnel)",
  },
  TECH_INSPECTION: {
    title: "Valider visite technique",
    refLabel: "Référence (optionnel)",
  },
  PARKING_CARD: {
    title: "Mettre à jour la carte parking",
    refLabel: "Référence (optionnel)",
  },
  EXTINGUISHER_CARD: {
    title: "Mettre à jour la carte extincteur",
    refLabel: "Référence (optionnel)",
  },
};

export function VehicleDocumentModal() {
  const { name, data, closeModal } = useModalStore();

  const { vehicle, documentType } = (data ?? {}) as {
    vehicle: Vehicle;
    documentType: VehicleDocumentType;
  };

  const { byVehicle, upsert } = useVehicleDocuments(vehicle?.id);
  const docs = (byVehicle.data ?? []) as any[];

  const existing = useMemo(
    () => docs.find((d) => d.type === documentType),
    [docs, documentType],
  );

  const defaults = useMemo<VehicleDocumentFormValues>(() => {
    return {
      reference: existing?.reference ?? "",
      provider: existing?.provider ?? "",
      issuedAt: existing?.issuedAt?.slice(0, 10) ?? "",
      expiresAt: existing?.expiresAt?.slice(0, 10) ?? "",
    };
  }, [existing]);

  const ui = DOC_UI[documentType];

  const onSubmit = async (values: VehicleDocumentFormValues) => {
    await upsert.mutateAsync({
      vehicleId: vehicle.id,
      type: documentType,
      reference: values.reference || undefined,
      provider: ui.showProvider ? values.provider || undefined : undefined,
      issuedAt: toIso(values.issuedAt),
      expiresAt: toIso(values.expiresAt)!,
      reminderDaysBefore: [30, 15, 7],
    });
    closeModal();
  };

  if (name !== ModalTypes.VEHICLE_DOCUMENT_MODAL) return null;

  return (
    <GenericFormModal
      title={ui.title}
      description={`${vehicle.plateNumber} • ${vehicle.brand} ${vehicle.model}`}
    >
      <ReusableForm
        id={existing?.id}
        schema={vehicleDocumentFormSchema}
        defaultValues={defaults}
        disabled={upsert.isPending}
        onSubmit={onSubmit}
        renderFields={({ register, formState: { errors } }) => (
          <div className="space-y-4">
            {ui.showProvider && (
              <FormFieldWrapper
                label="Assureur"
                error={errors.provider?.message}
              >
                <Input placeholder="NSIA, Ogar..." {...register("provider")} />
              </FormFieldWrapper>
            )}

            <FormFieldWrapper
              label={ui.refLabel}
              error={errors.reference?.message}
            >
              <Input
                placeholder="Ex: N° police..."
                {...register("reference")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Début (optionnel)"
              error={errors.issuedAt?.message}
            >
              <Input type="date" {...register("issuedAt")} />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Expire le"
              error={errors.expiresAt?.message}
            >
              <Input type="date" {...register("expiresAt")} />
            </FormFieldWrapper>
          </div>
        )}
      />
    </GenericFormModal>
  );
}
