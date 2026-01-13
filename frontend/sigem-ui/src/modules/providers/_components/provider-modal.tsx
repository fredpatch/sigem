import { useModalStore } from "@/stores/modal-store";
import { useCreateProvider, useUpdateProvider } from "../hooks/use-providers";
import { useConfirm } from "@/hooks/use-confirm";
import { ModalTypes } from "@/types/modal.types";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { Guidelines } from "@/common/guidelines";
import { ReusableForm } from "@/components/shared/form/form.component";
import { ProviderForm } from "./provider-form";
import {
  ProviderCreateInput,
  ProviderCreateSchema,
  providerDefaultValues,
  ProviderUpdateInput,
  ProviderUpdateSchema,
} from "../schema/provider.schema";
import { useMemo } from "react";
import { Provider } from "../types/types";

export const ProviderModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?.id);
  const { mutateAsync: createProvider, isPending } = useCreateProvider();
  const { mutateAsync: updateProvider, isPending: isUpdating } =
    useUpdateProvider();
  const [ConfirmDialog, confirm] = useConfirm();

  const pending = isPending || isUpdating;

  // console.log(data);
  const normalizedDefaults = useMemo(() => {
    if (!isEdit || !data) return providerDefaultValues;

    const d = data as Provider;

    return {
      ...providerDefaultValues,
      ...d,
      // sécurité sur arrays
      phones: d.phones ?? [],
      emails: d.emails ?? [],
      tags: d.tags ?? [],
    } satisfies ProviderUpdateInput;
  }, [isEdit, data]);

  const handleCreate = async (values: ProviderCreateInput) => {
    await createProvider(values);
  };

  const handleUpdate = async (values: ProviderUpdateInput) => {
    const ok = await confirm({
      title: "Mettre à jour le fournisseur ?",
      description:
        "Vous êtes sur le point de modifier les informations. Cette action est irréversible. Continuer ?",
      confirmText: "Oui",
      cancelText: "Annuler",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: isPending,
      autoCloseDelay: 5000,
    });

    if (!ok) return;
    await updateProvider({ id: (data as Provider).id, payload: values });
  };

  if (name !== ModalTypes.PROVIDERS_FORM) return null;
  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        className="md:min-w-[800px] xs:min-w-[400px] p-4"
        title={
          isEdit ? "Modifier le fournisseur" : "Enregistrer un fournisseur"
        }
        description="Veuillez remplir le formulaire ci-dessous pour enregistrer le fournisseur."
        classNameDescription="text-[0.75rem] -mt-1 text-muted-foreground"
      >
        <Guidelines
          className="mb-4 -mt-2"
          variant="tips"
          compact
          title="Conseils"
          items={[
            "Ajoutez au moins un numéro ou un email si possible.",
            "Utilisez une désignation claire (ex: Hôtel, Audit, Transport, etc.).",
            "Le site web doit commencer par http(s)://",
          ]}
        />
        <ReusableForm
          id={isEdit}
          schema={isEdit ? ProviderUpdateSchema : ProviderCreateSchema}
          defaultValues={normalizedDefaults as any}
          onSubmit={isEdit ? (handleUpdate as any) : (handleCreate as any)}
          disabled={pending}
          renderFields={(form) => <ProviderForm id={isEdit} form={form} />}
        />
      </GenericFormModal>
    </>
  );
};
