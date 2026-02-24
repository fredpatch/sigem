import { useModalStore } from "@/stores/modal-store";
import { useVehicles } from "../../hooks/use-vehicle";
import { useMemo } from "react";
import {
  defaultValues,
  VehicleCreateFormValues,
  vehicleFormSchema,
  VehicleFormValues,
} from "../../schema/vehicle.schema";
import {
  CreateVehicleDTO,
  UpdateVehicleDTO,
  Vehicle,
  VehicleStatus,
} from "../../types/vehicle.types";
import { ModalTypes } from "@/types/modal.types";
import { ReusableForm } from "@/components/shared/form/form.component";
import { useConfirm } from "@/hooks/use-confirm";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { VehicleForm } from "./vehicle-form";
import { useMgCreateVehicle } from "../../hooks/use-mg";

const toIso = (d?: string | null) => {
  if (!d) return undefined;
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
};

export const VehicleModal = () => {
  const { data, name } = useModalStore();
  const [ConfirmDialog, confirm] = useConfirm();
  const isEdit = Boolean(data?.id);
  // console.log(data);

  const { update } = useVehicles();
  const mgCreate = useMgCreateVehicle();

  const { mutateAsync: updateVehicle, isPending: updatePending } = update;

  const isPending = mgCreate.isPending || updatePending;
  const schema = vehicleFormSchema;

  const normalizedDefaults = useMemo<VehicleFormValues>(() => {
    if (!isEdit || !data) return defaultValues;

    const v = data as Vehicle;

    return {
      ...defaultValues,

      plateNumber: v.plateNumber ?? "",
      brand: v.brand ?? "",
      model: v.model ?? "",
      type: v.type ?? "",
      year: v.year ?? undefined,
      fiscalPower: (v as any).fiscalPower ?? undefined,

      usageType: (v as any).usageType ?? "SERVICE",
      energy: (v as any).energy ?? "ESSENCE",

      acquisitionDate: (v as any).acquisitionDate?.slice?.(0, 10) ?? "",
      firstRegistrationDate:
        (v as any).firstRegistrationDate?.slice?.(0, 10) ?? "",
      ownership: (v as any).ownership ?? "ANAC",

      currentMileage: v.currentMileage ?? 0,

      assignedToEmployeeMatricule:
        (v as any).assignedToEmployeeMatricule ?? undefined,
      assignedToName: (v as any).assignedToName ?? "",
      assignedToDirection: (v as any).assignedToDirection ?? "",
      assignedToFunction: (v as any).assignedToFunction ?? "",

      status: v.status ?? "ACTIVE",
      maintenanceNotes: (v as any).maintenanceNotes ?? "",
    };
  }, [isEdit, data]);

  const handleSave = async (values: VehicleFormValues) => {
    if (isEdit) {
      const currentVehicle = data as Vehicle;

      const ok = await confirm({
        title: "Modifier le véhicule ?",
        description:
          "Vous êtes sur le point de modifier les informations de ce véhicule.",
        confirmText: "Oui, continuer",
        cancelText: "Annuler",
        confirmVariant: "destructive",
        dangerIcon: true,
        loading: isPending,
        autoCloseDelay: 3000,
      });

      if (!ok) return;

      const editPayload: { id: string; payload: UpdateVehicleDTO } = {
        id: currentVehicle.id,
        payload: {
          plateNumber: values.plateNumber,
          brand: values.brand,
          model: values.model,
          type: values.type || undefined,
          year: values.year ?? undefined,

          usageType: values.usageType ?? undefined,
          energy: values.energy ?? undefined,
          acquisitionDate: values.acquisitionDate || undefined,
          firstRegistrationDate: values.firstRegistrationDate || undefined,
          ownership: values.ownership || undefined,

          currentMileage: values.currentMileage,

          assignedToEmployeeMatricule:
            values.assignedToEmployeeMatricule ?? undefined,
          assignedToName: values.assignedToName || undefined,
          assignedToDirection: values.assignedToDirection || undefined,
          assignedToFunction: values.assignedToFunction || undefined,

          fiscalPower: values.fiscalPower ?? undefined,
          status: values.status as VehicleStatus,

          maintenanceNotes: values.maintenanceNotes || undefined,
        },
      };

      await updateVehicle(editPayload);
      return;
    }

    // CREATE (MG)
    const payload = {
      vehicle: {
        plateNumber: values.plateNumber,
        brand: values.brand,
        model: values.model,
        type: values.type || undefined,
        year: values.year ?? undefined,

        usageType: values.usageType ?? undefined,
        energy: values.energy ?? undefined,
        acquisitionDate: toIso(values.acquisitionDate),
        firstRegistrationDate: toIso(values.firstRegistrationDate),
        ownership: values.ownership || "ANAC",

        currentMileage: values.currentMileage ?? 0,
        mileageUpdatedAt: new Date().toISOString(),

        assignedToEmployeeMatricule:
          values.assignedToEmployeeMatricule ?? undefined,
        assignedToName: values.assignedToName || undefined,
        assignedToDirection: values.assignedToDirection || undefined,
        assignedToFunction: values.assignedToFunction || undefined,

        fiscalPower: values.fiscalPower ?? undefined,
        maintenanceNotes: values.maintenanceNotes || undefined,
      },
      documents: {
        insurance: values.insuranceExpiresAt
          ? {
              expiresAt: toIso(values.insuranceExpiresAt)!,
              issuedAt: toIso(values.insuranceIssuedAt),
              reference: values.insuranceReference || undefined,
              provider: values.insuranceProvider || undefined,
            }
          : undefined,

        techInspection: values.techInspectionExpiresAt
          ? {
              expiresAt: toIso(values.techInspectionExpiresAt)!,
              issuedAt: toIso(values.techInspectionIssuedAt),
              reference: values.techInspectionReference || undefined,
            }
          : undefined,

        parkingCard: values.parkingCardExpiresAt
          ? {
              expiresAt: toIso(values.parkingCardExpiresAt)!,
              issuedAt: toIso(values.parkingCardIssuedAt),
              reference: values.parkingCardReference || undefined,
            }
          : undefined,

        extinguisher: values.extinguisherExpiresAt
          ? {
              expiresAt: toIso(values.extinguisherExpiresAt)!,
              issuedAt: toIso(values.extinguisherIssuedAt),
              reference: values.extinguisherReference || undefined,
            }
          : undefined,
      },
    };

    await mgCreate.mutateAsync(payload as any);
  };

  const title = isEdit ? "Modifier le véhicule" : "Nouveau véhicule";
  const description = isEdit
    ? "Mettez à jour les informations de ce véhicule."
    : "Enregistrez un nouveau véhicule dans le parc.";

  if (name !== ModalTypes.VEHICLE_MANAGEMENT_FORM) return null;

  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        className="min-w-[800px]"
        title={title}
        description={description}
      >
        <ReusableForm
          id={isEdit}
          disabled={isPending}
          schema={schema}
          defaultValues={normalizedDefaults}
          onSubmit={handleSave}
          renderFields={(form) => <VehicleForm form={form} isEdit={isEdit} />}
        />
      </GenericFormModal>
    </>
  );
};
