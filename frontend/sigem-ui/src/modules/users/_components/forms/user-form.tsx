import { UserDefaultValue, userSchema } from "@/schema/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Ban, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ReusableForm } from "@/components/shared/form/form.component";
import { UserForm } from "./form";
import { ModalTypes } from "@/types/modal.types";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { useModalStore } from "@/stores/modal-store";
import { useUser } from "../../hooks/useUser";

type UserFormValues = z.infer<typeof userSchema>;

export const UserFormModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?._id);
  const { update, deactivate } = useUser(data?._id);
  const [ConfirmDialog, confirm] = useConfirm();

  const isPending = update.isPending || deactivate.isPending;

  const handleSubmit = async (values: UserFormValues) => {
    if (isEdit) {
      await update.mutateAsync(values, data?._id);
      // console.log("UPDATE USER::", data);
    } else {
      // await createUser.mutateAsync(values);
      console.log("CREATE USER::", values);
    }
  };

  const handleDeactivate = async () => {
    const ok = await confirm({
      title: "Deactivate User Account?",
      description:
        "Are you sure you want to turn off this user account? He won't be able to connect after this.",
      confirmText: "Confirm Deactivate",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: deactivate.isPending,
      autoCloseDelay: 5000, // 5s
    });

    if (ok) {
      await deactivate.mutateAsync(data._id);
      // console.log("DELETE USER::", data._id);
    }
  };

  const footerActions = isEdit ? (
    <>
      {!data?.isBlocked ? (
        <Button type="button" onClick={handleDeactivate} variant="destructive">
          <Trash className="size-4" />
          Deactivate
        </Button>
      ) : (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-help text-xs underline">
                <Button type="button" disabled variant="outline">
                  <div className="flex items-center gap-2">
                    <Ban className="size-4" />
                    Deactivated
                  </div>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="text-xs">
                Before continuing, you need to reactivate this user.
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  ) : null;

  if (name !== ModalTypes.USER_FORM) return null;

  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        title={
          isEdit
            ? "Modifier l'utilisateur"
            : "Enregistrer un nouvel utilisateur"
        }
        description="Vous pouvez gérer les informations et disponibilités des utilisateurs ici."
        classNameDescription="text-[0.75rem] -mt-1 text-muted-foreground"
        className="max-w-4xl min-w-3xl"
      >
        <ReusableForm
          id={isEdit}
          schema={userSchema}
          defaultValues={data ?? UserDefaultValue}
          onSubmit={handleSubmit}
          disabled={isPending}
          footerActions={footerActions}
          renderFields={(form) => <UserForm id={isEdit} form={form} />}
        />
      </GenericFormModal>
    </>
  );
};
