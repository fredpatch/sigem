import { useModalStore } from "@/stores/modal-store";
import { useVehicles } from "../../hooks/use-vehicle";
import { useMemo } from "react";
import {
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

export const VehicleModal = () => {
  const { data, name } = useModalStore();
  const [ConfirmDialog, confirm] = useConfirm();
  const isEdit = Boolean(data?.id);
  // console.log(data);

  const { create, update } = useVehicles();
  const { mutateAsync: addVehicle, isPending: createPending } = create;
  const { mutateAsync: updateVehicle, isPending: updatePending } = update;

  const isPending = createPending || updatePending;
  const schema = vehicleFormSchema;

  const normalizedDefaults = useMemo<VehicleFormValues>(() => {
    if (!isEdit || !data) {
      return {
        plateNumber: "",
        brand: "",
        model: "",
        type: "",
        year: undefined,
        fiscalPower: undefined,

        usageType: "SERVICE",
        energy: "ESSENCE",

        acquisitionDate: "",
        firstRegistrationDate: "",
        ownership: "ANAC",
        currentMileage: 0,

        assignedToEmployeeMatricule: undefined,
        assignedToName: "",
        assignedToDirection: "",
        assignedToFunction: "",

        status: "ACTIVE",

        maintenanceNotes: "",
      };
    }

    const v = data as Vehicle;

    return {
      plateNumber: v.plateNumber ?? "",
      brand: v.brand ?? "",
      model: v.model ?? "",
      type: v.type ?? "",
      year: v.year ?? undefined,
      fiscalPower: v.fiscalPower ?? undefined,
      usageType: v.usageType ?? "SERVICE",
      energy: v.energy ?? "ESSENCE",
      acquisitionDate: v.acquisitionDate?.slice(0, 10) ?? "",
      firstRegistrationDate: v.firstRegistrationDate?.slice(0, 10) ?? "",
      ownership: v.ownership ?? "ANAC",
      currentMileage: v.currentMileage ?? 0,
      assignedToEmployeeMatricule:
        (v as any).assignedToEmployeeMatricule ?? undefined,
      assignedToName: v.assignedToName ?? "",
      assignedToDirection: v.assignedToDirection ?? "",
      assignedToFunction: (v as any).assignedToFunction ?? "",

      status: v.status ?? "ACTIVE",
      maintenanceNotes: v.maintenanceNotes ?? "",
    };
  }, [isEdit, data]);

  const handleSave = async (values: any) => {
    if (isEdit) {
      const currentVehicle = data as Vehicle;
      const form = values as VehicleFormValues;

      const ok = await confirm({
        title: "Modifier le véhicule ?",
        description:
          "Vous êtes sur le point de modifier les information de ce vehicule.",
        confirmText: "Oui, continuer",
        cancelText: "Annuler",
        confirmVariant: "destructive",
        dangerIcon: true,
        loading: isPending,
        autoCloseDelay: 3000,
      });

      const editPayload: { id: string; payload: UpdateVehicleDTO } = {
        id: (data as Vehicle).id,
        payload: {
          plateNumber: form.plateNumber,
          brand: form.brand,
          model: form.model,
          type: form.type || undefined,
          year: form.year ?? undefined,

          usageType: form.usageType ?? undefined,
          energy: form.energy ?? undefined,
          acquisitionDate: form.acquisitionDate || undefined,
          firstRegistrationDate: form.firstRegistrationDate || undefined,
          ownership: form.ownership || undefined,

          currentMileage: form.currentMileage,

          assignedToEmployeeMatricule:
            form.assignedToEmployeeMatricule ?? undefined,
          assignedToName: form.assignedToName || undefined,
          assignedToDirection: form.assignedToDirection || undefined,
          assignedToFunction: form.assignedToFunction || undefined,
          fiscalPower: form.fiscalPower ?? undefined,
          status: form.status as VehicleStatus,

          maintenanceNotes: currentVehicle.maintenanceNotes || undefined,
        },
      };

      if (ok) {
        await updateVehicle(editPayload);
        // console.log("UPDATE PAYLOAD", editPayload);
        // toast.success("Véhicule mis à jour");
      }
    } else {
      const vehicle = values as VehicleCreateFormValues;

      const createPayload: CreateVehicleDTO = {
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type || undefined,
        year: vehicle.year ?? undefined,

        usageType: vehicle.usageType ?? undefined,
        energy: vehicle.energy ?? undefined,
        acquisitionDate: vehicle.acquisitionDate || undefined,
        firstRegistrationDate: vehicle.firstRegistrationDate || undefined,
        ownership: vehicle.ownership || "ANAC",

        currentMileage: vehicle.currentMileage,

        assignedToEmployeeMatricule:
          vehicle.assignedToEmployeeMatricule ?? undefined,
        assignedToName: vehicle.assignedToName || undefined,
        assignedToDirection: vehicle.assignedToDirection || undefined,
        assignedToFunction: vehicle.assignedToFunction || undefined,
        fiscalPower: vehicle.fiscalPower ?? undefined,
        status: (vehicle.status as VehicleStatus) ?? "ACTIVE",

        maintenanceNotes: vehicle.maintenanceNotes || undefined,
      };

      await addVehicle(createPayload);
      // console.log("CREATE", vehicle);
      // toast.success("Véhicule créé");
    }
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
