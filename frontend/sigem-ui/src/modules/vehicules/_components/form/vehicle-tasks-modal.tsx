import { useModalStore } from "@/stores/modal-store";
import {
  useCreateVehicleTask,
  useUpdateVehicleTask,
} from "../../hooks/use-vehicle-tasks";
import { useConfirm } from "@/hooks/use-confirm";
import { ModalTypes } from "@/types/modal.types";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { ReusableForm } from "@/components/shared/form/form.component";
import {
  VehicleTaskCreateFormValues,
  VehicleTaskCreateSchema,
  VehicleTaskUpdateFormValues,
  VehicleTaskUpdateSchema,
} from "../../schema/vehicle-task.schemas";
// import { VehicleTasksForm } from "./vehicle-tasks-form";
import { useMemo } from "react";
import {
  TaskTriggerType,
  VehicleTask,
  VehicleTaskType,
} from "../../types/types";
import { VehicleTasksForm2 } from "./vehicle-tasks-form copy";

export const VehicleTasksModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?._id);
  const { mutateAsync: update, isPending: pendingUpdate } =
    useUpdateVehicleTask();
  const { mutateAsync: create, isPending: pendingCreate } =
    useCreateVehicleTask();
  const [ConfirmDialog, confirm] = useConfirm();

  // console.log(data);

  const isPending = pendingCreate || pendingUpdate;

  const normalizedDefaults = useMemo<
    VehicleTaskCreateFormValues | VehicleTaskUpdateFormValues
  >(() => {
    if (!isEdit || !data) {
      const payload = (data || {}) as any;

      // in creation vehicleId and documentID comes from the cell
      const vehicleIdFromPayload =
        typeof payload.vehicleId === "string"
          ? payload.vehicleId
          : payload.vehicleId?.id || payload.vehicleId?._id || "";

      return {
        vehicleId: vehicleIdFromPayload,
        dept: "MG", // ou récup depuis auth/user

        templateId: undefined,
        type: undefined,
        id: data?._id ?? undefined,
        triggerType: undefined,
        label: "",
        description: "",
        dueAt: undefined,
        dueMileage: undefined,
        severity: "warning",

        vehicleDocumentId: payload.vehicleDocumentId ?? null,
        documentType: payload.documentType ?? undefined,
        vehicleLabel: payload.vehicleLabel ?? undefined,
        vehiclePlate: payload.vehiclePlate ?? undefined,
      };
    }

    const task = data as VehicleTask;

    return {
      id: (task as any)._id ?? (task as any).id,
      vehicleId: task.vehicleId,
      dept: (task as any).dept ?? "MG",
      templateId: task.templateId ?? undefined,
      type: task.type,
      triggerType: (task as any).triggerType,
      label: task.label ?? "",
      description: task.description ?? "",
      dueAt: task.dueAt ?? undefined,
      dueMileage: task.dueMileage ?? undefined,
      severity: task.severity ?? "warning",

      vehicleDocumentId: task.vehicleDocumentId ?? null,
      documentType: (task as any).documentType ?? null,
      vehiclePlate: (task as any).vehiclePlate ?? "",
      vehicleLabel: (task as any).vehicleLabel ?? "",
    };
  }, [isEdit, data]);

  const handleSave = async (values: any) => {
    // console.log("[create vehicle task] payload", values);
    if (isEdit) {
      const task = data as VehicleTask;

      const ok = await confirm({
        title: "Mettre à jour la tâche ?",
        description:
          "Vous êtes sur le point de modifier cette tâche. Cette action est irréversible.",
        confirmText: "Oui, continuer",
        cancelText: "Annuler",
        confirmVariant: "destructive",
        dangerIcon: true,
        loading: isPending,
        autoCloseDelay: 3000,
      });

      if (!ok) return;

      const { id, ...rest } = values as VehicleTaskUpdateFormValues;

      await update({
        id: task._id,
        payload: {
          label: rest.label,
          description: rest.description ?? "",
          dueAt: rest.dueAt,
          dueMileage: rest.dueMileage ?? null,
          severity: rest.severity,
          // status éventuellement plus tard
        },
      });
    } else {
      const createValues = values as VehicleTaskCreateFormValues;

      await create({
        vehicleId: createValues.vehicleId,
        vehicleDocumentId: createValues.vehicleDocumentId ?? undefined,
        dept: createValues.dept,
        templateId:
          createValues.templateId === undefined ||
            createValues.templateId === ""
            ? undefined
            : createValues.templateId || undefined,

        type: (createValues.type || undefined) as VehicleTaskType | undefined,
        triggerType: (createValues.triggerType || undefined) as
          | TaskTriggerType
          | undefined,

        label: createValues.label,
        description:
          createValues.description === null || createValues.description === ""
            ? undefined
            : createValues.description,

        dueAt: createValues.dueAt ?? null,
        dueMileage:
          typeof createValues.dueMileage === "number"
            ? createValues.dueMileage
            : null,
        severity: createValues.severity, // déjà bien typé
      });

      // console.log("[create vehicle task] payload", createValues);
    }
  };

  if (
    name !== ModalTypes.VEHICLE_TASK_PLAN_FROM_DOCUMENT &&
    name !== ModalTypes.VEHICLE_TASK_PLAN_FROM_VEHICLE &&
    name !== ModalTypes.VEHICLE_TASKS_FORM
  )
    return null;

  const vehicleTitle =
    data?.vehiclePlate ||
    data?.vehicleLabel ||
    (typeof data?.vehicleId === "string" ? data?.vehicleId : "");

  const description = vehicleTitle
    ? `Définissez les informations de la tâche pour le véhicule ${vehicleTitle}.`
    : "Définissez les informations de la tâche associée au véhicule.";

  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        className="min-w-[600px] md:min-w-[800px]"
        title={isEdit ? "Mettre à jour la tâche" : "Planifier une tâche"}
        description={description}
      >
        <ReusableForm
          id={isEdit}
          disabled={isPending}
          schema={isEdit ? VehicleTaskUpdateSchema : VehicleTaskCreateSchema}
          defaultValues={normalizedDefaults}
          onSubmit={handleSave}
          renderFields={(form) => (
            // <VehicleTasksForm form={form} isEdit={isEdit} />
            <VehicleTasksForm2 form={form} isEdit={isEdit} />
          )}
        />
      </GenericFormModal>
    </>
  );
};
