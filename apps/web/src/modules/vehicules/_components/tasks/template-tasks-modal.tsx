import { ReusableForm } from "@/components/shared/form/form.component";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { TemplateTasksForm } from "./template-tasks-form";
import {
  useCreateVehicleTaskTemplate,
  useUpdateVehicleTaskTemplate,
} from "../../hooks/use-template-task";
import { useMemo } from "react";
import {
  VehicleTaskTemplateCreateFormValues,
  VehicleTaskTemplateCreateSchema,
  VehicleTaskTemplateUpdateFormValues,
  VehicleTaskTemplateUpdateSchema,
} from "../../schema/template-task.schema";

export const TemplateTasksModal = () => {
  const { data, name } = useModalStore();
  // console.log(data);
  const isEdit = Boolean((data as any)?.id);

  const { mutateAsync: createTemplate, isPending: pendingCreate } =
    useCreateVehicleTaskTemplate();
  const { mutateAsync: updateTemplate, isPending: pendingUpdate } =
    useUpdateVehicleTaskTemplate(data?.id);

  const [ConfirmDialog, confirm] = useConfirm();

  // console.log(data);

  const isPending = pendingCreate || pendingUpdate;

  const normalizedDefaults = useMemo<
    VehicleTaskTemplateCreateFormValues | VehicleTaskTemplateUpdateFormValues
  >(() => {
    if (!isEdit || !data) {
      return {
        id: undefined,
        dept: "MG",
        label: "",
        description: "",
        type: "DOCUMENT_RENEWAL",
        triggerType: "BY_DATE",
        everyKm: null,
        everyMonths: null,
        noticeKmBefore: 500,
        noticeDaysBefore: 30,
        defaultSeverity: "warning",
        requiresDocument: true, // 🧠 par défaut pour modèles doc
        documentType: "INSURANCE", // optionnel mais pratique
        active: true,
      };
    }

    const tpl = data as any;

    return {
      id: (tpl as any).id ?? (tpl as any)._id,
      dept: tpl.dept || "MG",
      label: tpl.label,
      description: tpl.description ?? "",
      type: tpl.type,
      triggerType: tpl.triggerType,
      everyKm: tpl.everyKm ?? null,
      everyMonths: tpl.everyMonths ?? null,
      noticeKmBefore: tpl.noticeKmBefore ?? null,
      noticeDaysBefore: tpl.noticeDaysBefore ?? null,
      defaultSeverity: tpl.defaultSeverity ?? "warning",
      requiresDocument: (tpl as any).requiresDocument ?? false,
      documentType: (tpl as any).documentType ?? null,
      active: tpl.active ?? true,
    };
  }, [isEdit, data]);

  const handleSave = async (values: any) => {
    if (isEdit) {
      const ok = await confirm({
        title: "Mettre à jour le modèle ?",
        description:
          "Vous êtes sur le point de modifier ce modèle de tâche. Les futures tâches planifiées utiliseront ces nouvelles valeurs.",
        confirmText: "Oui, continuer",
        cancelText: "Annuler",
        confirmVariant: "destructive",
        dangerIcon: true,
        loading: isPending,
        autoCloseDelay: 3000,
      });

      if (!ok) return;

      const { id, ...rest } = values as VehicleTaskTemplateUpdateFormValues;

      await updateTemplate({
        label: rest.label,
        description: rest.description ?? undefined,
        type: rest.type,
        triggerType: rest.triggerType,
        everyKm: rest.everyKm ?? null,
        everyMonths: rest.everyMonths ?? null,
        noticeKmBefore: rest.noticeKmBefore ?? null,
        noticeDaysBefore: rest.noticeDaysBefore ?? null,
        defaultSeverity: rest.defaultSeverity,
        requiresDocument: rest.requiresDocument, // 🆕
        documentType: rest.requiresDocument
          ? (rest.documentType ?? null)
          : null,
        active: rest.active,
      });
      // console.log("rest", rest);
    } else {
      const createValues = values as VehicleTaskTemplateCreateFormValues;

      await createTemplate({
        dept: createValues.dept,
        label: createValues.label,
        description:
          createValues.description === ""
            ? undefined
            : createValues.description,
        type: createValues.type,
        triggerType: createValues.triggerType,
        everyKm: createValues.everyKm ?? null,
        everyMonths: createValues.everyMonths ?? null,
        noticeKmBefore: createValues.noticeKmBefore ?? null,
        noticeDaysBefore: createValues.noticeDaysBefore ?? null,
        defaultSeverity: createValues.defaultSeverity,
        requiresDocument: createValues.requiresDocument ?? false,
        documentType: createValues.requiresDocument
          ? (createValues.documentType ?? null)
          : null,
        active: createValues.active ?? true,
      });
    }
  };

  if (name !== ModalTypes.TEMPLATE_TASKS_FORM) return null;
  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        title={
          isEdit ? "Modifier le modèle de tâche" : "Nouveau modèle de tâche"
        }
        description="Configurez un modèle de tâche récurrente pour les véhicules."
        className="min-w-[800px]"
      >
        <ReusableForm
          id={isEdit}
          disabled={isPending}
          schema={
            isEdit
              ? VehicleTaskTemplateUpdateSchema
              : VehicleTaskTemplateCreateSchema
          }
          defaultValues={normalizedDefaults}
          onSubmit={handleSave}
          renderFields={(form) => (
            <TemplateTasksForm form={form} isEdit={isEdit} />
          )}
        />
      </GenericFormModal>
    </>
  );
};
