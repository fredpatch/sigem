import { useConfirm } from "@/hooks/use-confirm";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useCategory } from "../../hooks/useCategory";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { ReusableForm } from "@/components/shared/form/form.component";
import {
  CategoryCreateSchema,
  CategoryUpdateSchema,
} from "../../schema/schema";
import { useMemo } from "react";
import { CategoryForm } from "./category-form";

export const CategoryModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?._id);
  const { create, update } = useCategory(data?._id);
  const [ConfirmDialog, confirm] = useConfirm();

  // console.log(data);

  const isPending = create.isPending || update.isPending;

  const normalizedDefaults = useMemo(() => {
    if (!isEdit || !data) {
      return {
        label: "",
        family: undefined,
        parentId: null,
        description: "",
      };
    }

    return {
      id: data._id,
      label: data.label ?? "",
      family: data.family ?? undefined,
      parentId: data.parentId?._id ?? null,
      description: data.description ?? "",
    };
  }, [isEdit, data]);

  const handleSave = async (values: any) => {
    if (isEdit) {
      const ok = await confirm({
        title: "Update category?",
        description:
          "You are about to change the value of that category, you cannot undo that operation! Do you want to continue?",
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

  if (name !== ModalTypes.CATEGORY_FORM) return null;
  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        title={isEdit ? "Update category" : "Create category"}
        description="Manage category information"
      >
        <ReusableForm
          id={isEdit}
          disabled={isPending}
          schema={isEdit ? CategoryUpdateSchema : CategoryCreateSchema}
          defaultValues={normalizedDefaults}
          onSubmit={handleSave}
          renderFields={(form) => <CategoryForm form={form} isEdit={isEdit} />}
        />
      </GenericFormModal>
    </>
  );
};
