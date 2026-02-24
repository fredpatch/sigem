import { useModalStore } from "@/stores/modal-store";
import { useUser } from "../../hooks/useUser";
import { useConfirm } from "@/hooks/use-confirm";
import { resetPasswordSchema } from "@/schema/schema";
import z from "zod";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { ModalTypes } from "@/types/modal.types";
import { ReusableForm } from "@/components/shared/form/form.component";
import { ResetForm } from "./reset-form";

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetFormModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?._id);
  const { reset } = useUser(data?._id);
  const [ConfirmDialog, confirm] = useConfirm();

  const isPending = reset.isPending;

  const handleSubmit = async (values: ResetFormValues) => {
    const ok = await confirm({
      title: "Reset user password?",
      description:
        "You are about to reset this user password, you cannot undo that operation! Do you want to continue?",
      confirmText: "Yes",
      cancelText: "Abort",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: reset.isPending,
      autoCloseDelay: 5000, // 5s
    });

    if (ok) {
      await reset.mutateAsync({
        currentPassword: values.currentPassword!,
        newPassword: values.newPassword!,
        confirmPassword: values.confirmPassword!,
      });
      // console.log("UPDATED USER::", values);
    }
  };

  if (name !== ModalTypes.RESET_FORM) return null;

  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        title={"Reset user password"}
        description="You can manage users password reset request here."
        classNameDescription="text-[0.75rem] -mt-1 text-muted"
      >
        <ReusableForm
          id={isEdit}
          schema={resetPasswordSchema}
          defaultValues={data}
          onSubmit={handleSubmit}
          disabled={isPending}
          renderFields={(form) => <ResetForm id={isEdit} form={form} />}
        />
      </GenericFormModal>
    </>
  );
};
