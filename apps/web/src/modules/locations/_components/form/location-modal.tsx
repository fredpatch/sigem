import { useConfirm } from "@/hooks/use-confirm";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { ReusableForm } from "@/components/shared/form/form.component";
import { useMemo } from "react";
import { useLocation } from "../../hooks/useLocation";
import {
  LocationCreateInput,
  LocationCreateSchema,
  LocationUpdateInput,
  LocationUpdateSchema,
} from "../../schema/schema";
import { LocationForm } from "./location-form";

export const LocationModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?._id);
  const { create, update } = useLocation(data?._id);
  const [ConfirmDialog, confirm] = useConfirm();

  const isPending = create.isPending || update.isPending;

  const normalizedDefaults = useMemo(() => {
    if (!isEdit || !data) {
      const defaults: LocationCreateInput = {
        localisation: "",
        batiment: "",
        direction: "",
        bureau: "",
        level: "BUREAU",
        notes: "",
      };
      return defaults;
    }

    const d: any = data;

    const defaults: LocationUpdateInput = {
      id: d._id,
      localisation: d.localisation ?? "",
      batiment: d.batiment ?? "",
      direction: d.direction ?? "",
      bureau: d.bureau ?? "",
      level: (d.level as any) ?? "BUREAU",
      notes: d.notes ?? "",
    };

    return defaults;
  }, [isEdit, data]);

  const handleSave = async (values: any) => {
    if (isEdit) {
      const ok = await confirm({
        title: "Update location?",
        description:
          "You are about to change the parameters of that location, you cannot undo that operation! Do you want to continue?",
        confirmText: "Yes",
        cancelText: "Abort",
        confirmVariant: "destructive",
        dangerIcon: true,
        loading: isPending,
        autoCloseDelay: 5000,
      });

      if (ok) {
        await update.mutateAsync(values);
      }
    } else {
      await create.mutateAsync(values);
    }
  };

  if (name !== ModalTypes.LOCATION_FORM) return null;
  // if (locationName !== ModalTypes.LOCATION_FAST_FORM) return null;
  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        title={isEdit ? "Modifier l'emplacement" : "Créer un emplacement"}
        description="Vous pouvez structurer les emplacements selon la hiérarchie : Site → Bâtiment → Direction → Bureau."
        className="min-w-2xl p-4"
      >
        <ReusableForm
          id={isEdit}
          disabled={isPending}
          schema={isEdit ? LocationUpdateSchema : LocationCreateSchema}
          defaultValues={normalizedDefaults}
          onSubmit={handleSave}
          renderFields={(form) => <LocationForm form={form} isEdit={isEdit} />}
        />
      </GenericFormModal>
    </>
  );
};
