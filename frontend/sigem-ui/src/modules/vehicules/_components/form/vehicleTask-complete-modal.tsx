// src/features/vehicles/components/VehicleTaskCompleteModal.tsx
import { useMemo } from "react";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { ReusableForm } from "@/components/shared/form/form.component";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useCompleteVehicleTask,
  useVehicleTask,
} from "../../hooks/use-vehicle-tasks";
import { VehicleTask } from "../../types/types";
import {
  VehicleTaskCompleteFormValues,
  vehicleTaskCompleteSchema,
} from "../../schema/vehicle-complete-task.schema";
import { Input } from "@/components/ui/input";
import { Guidelines } from "@/common/guidelines";

export const VehicleTaskCompleteModal = () => {
  const { name, data, closeModal } = useModalStore();
  const isEdit = Boolean(data?._id);
  const [ConfirmDialog, confirm] = useConfirm();
  const { mutateAsync: completeTask, isPending } = useCompleteVehicleTask(); // à adapter selon ton hook

  const vehicleId = (data as any)?.id;
  const { data: vehicleTask, isLoading } = useVehicleTask(vehicleId);

  const task = vehicleTask as VehicleTask & {
    vehiclePlate?: string;
    vehicleLabel?: string;
    vehicleCurrentMileage?: number;
  };

  // console.log("Vehicle Task Complete Modal data:", vehicleTask);

  const taskType = task?.type;
  const triggerType = (task as any)?.triggerType;

  // Ce qui a du sens métier côté complétion
  const showMileageField =
    taskType === "OIL_CHANGE" ||
    taskType === "MAINTENANCE" ||
    triggerType === "BY_MILEAGE" ||
    triggerType === "BY_DATE_OR_MILEAGE";

  const showDateField =
    taskType === "DOCUMENT_RENEWAL" ||
    taskType === "MAINTENANCE" ||
    triggerType === "BY_DATE" ||
    triggerType === "BY_DATE_OR_MILEAGE";

  // Valeurs par défaut :
  const defaultValues = useMemo<VehicleTaskCompleteFormValues>(() => {
    const today = new Date().toISOString().slice(0, 10);

    // Stratégie de remplissage du km :
    // 1) completedMileage déjà existant
    // 2) dueMileage
    // 3) km actuel du véhicule (si fourni en data)
    let defaultMileage: number | undefined = undefined;

    if (typeof (task as any)?.completedMileage === "number") {
      defaultMileage = (task as any).completedMileage;
    } else if (typeof task?.dueMileage === "number") {
      defaultMileage = task?.dueMileage;
    } else if (typeof (task as any)?.vehicleCurrentMileage === "number") {
      defaultMileage = (task as any).vehicleCurrentMileage;
    }

    return {
      completedAt: today,
      completedMileage: defaultMileage,
      completionComment: "",
    };
  }, [task]);

  const title = `Terminer la tâche`;
  const description = task
    ? `Vous êtes sur le point de marquer comme complétée la tâche "${task.label}"${
        task.vehiclePlate || task.vehicleLabel
          ? ` pour le véhicule ${
              task.vehiclePlate
                ? `${task.vehiclePlate}${
                    task.vehicleLabel ? ` (${task.vehicleLabel})` : ""
                  }`
                : task.vehicleLabel
            }`
          : ""
      }.`
    : "Vous êtes sur le point de marquer une tâche comme complétée.";

  const handleSubmit = async (values: VehicleTaskCompleteFormValues) => {
    if (!task?._id) return;

    const ok = await confirm({
      title: "Terminer la tâche ?",
      description:
        "Cette opération mettra à jour le statut de la tâche et pourra mettre à jour les informations du véhicule (kilométrage, échéances, etc.).",
      confirmText: "Oui, terminer",
      cancelText: "Annuler",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: isPending,
      autoCloseDelay: 2500,
    });

    if (!ok) return;

    await completeTask({
      id: task._id,
      payload: {
        completedAt: values.completedAt
          ? new Date(values.completedAt)
          : undefined,
        completedMileage: values.completedMileage,
        completionComment: values.completionComment,
      },
    });

    closeModal();
  };

  if (name !== ModalTypes.VEHICLE_COMPLETE_TASKS_FORM) return null;
  if (isLoading) return null;

  return (
    <>
      <ConfirmDialog />

      <GenericFormModal
        title={title}
        description={description}
        className="min-w-[800px]"
      >
        <ReusableForm
          id={isEdit}
          disabled={isPending}
          schema={vehicleTaskCompleteSchema}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          renderFields={(form) => (
            <div className="space-y-4">
              <Guidelines
                variant="tips"
                className="-mt-2"
                compact
                title="Finalisation de la tâche"
                description="Terminer une tâche = mettre à jour le véhicule + préparer la suivante."
                items={[
                  "Le kilométrage saisi met à jour le véhicule.",
                  "Il sert de base pour calculer la prochaine échéance automatique.",
                  "Le commentaire permet de garder une trace de l’intervention réalisée.",
                  "Une tâche terminée peut générer automatiquement la suivante si elle est récurrente.",
                ]}
              />

              {/* Date de complétion */}
              {showDateField && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Date de complétion
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    {...form.register("completedAt")}
                  />
                </div>
              )}

              {/* Kilométrage */}
              {showMileageField && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Kilométrage au moment de l&apos;intervention
                  </label>
                  <Input
                    type="number"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    {...form.register("completedMileage", {
                      valueAsNumber: true,
                    })}
                    placeholder="Ex: 125000"
                    min={0}
                  />
                </div>
              )}

              {/* Commentaire */}
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Commentaire (optionnel)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  {...form.register("completionComment")}
                  placeholder="Ex: Vidange effectuée, filtre à huile changé..."
                />
              </div>
            </div>
          )}
        />
      </GenericFormModal>
    </>
  );
};
