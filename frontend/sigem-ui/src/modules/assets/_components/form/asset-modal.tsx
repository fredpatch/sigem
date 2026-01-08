import { useConfirm } from "@/hooks/use-confirm";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useAsset } from "../../hooks/useAsset";
import {
  AssetCreateInput,
  AssetCreateSchema,
  assetDefaultValues,
  AssetUpdateInput,
  AssetUpdateSchema,
} from "../../schema/schema";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { ReusableForm } from "@/components/shared/form/form.component";
import { AssetForm } from "./asset-form";
import { useMemo } from "react";
import { Guidelines } from "@/common/guidelines";

export const AssetModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?._id);
  const { create, update } = useAsset(data?._id);
  const [ConfirmDialog, confirm] = useConfirm();

  // console.log(data);

  const isPending = create.isPending || update.isPending;

  // 🧠 Normalisation des valeurs par défaut
  const normalizedDefaults = useMemo(() => {
    if (!isEdit || !data) {
      return assetDefaultValues as AssetCreateInput;
    }

    const d: any = data;

    return {
      // base defaults (pour être sûr d’avoir tous les champs)
      ...assetDefaultValues,
      // values from backend
      ...d,
      // override nested objects with just ids
      categoryId: d.categoryId?._id ?? "",
      locationId: d.locationId?._id ?? "",
    } satisfies AssetUpdateInput;
  }, [isEdit, data]);

  const handleUpdate = async (values: AssetUpdateInput) => {
    const ok = await confirm({
      title: "Update asset?",
      description:
        "You are about to change some of the asset values, you cannot undo that operation! Do you want to continue?",
      confirmText: "Yes",
      cancelText: "Abort",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: isPending,
      autoCloseDelay: 5000,
    });

    if (ok) {
      // Tu peux aussi forcer l'id ici selon ton hook useAsset
      await update.mutateAsync(values);

      // console.log("ASSET UPDATE", values);
    }
  };

  const handleCreate = async (values: AssetCreateInput) => {
    await create.mutateAsync(values);
    // console.log("CREATE ASSET::", values);
  };

  if (name !== ModalTypes.ASSETS_FORM) return null;
  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        className="min-w-[800px] p-4"
        title={isEdit ? "Modifier le bien" : "Enregistrer un bien"}
        description="Veuillez remplir le formulaire ci-dessous pour enregistrer le bien."
        classNameDescription="text-[0.75rem] -mt-1 text-muted-foreground"
      >
        <Guidelines
          className="mb-4 -mt-2"
          variant="tips"
          compact
          title="Avant d’enregistrer"
          items={[
            "Choisissez le bureau + famille de catégorie pour une classification correcte.",
            "Renseignez marque, modèle et numéro de série si disponibles (traçabilité).",
            "Mettez le statut à jour pour refléter l’état réel (En service / En panne / etc.).",
          ]}
        />
        <ReusableForm
          id={isEdit}
          schema={isEdit ? AssetUpdateSchema : AssetCreateSchema}
          defaultValues={normalizedDefaults}
          onSubmit={isEdit ? (handleUpdate as any) : (handleCreate as any)}
          disabled={isPending}
          renderFields={(form) => <AssetForm id={isEdit} form={form} />}
        />
      </GenericFormModal>
    </>
  );
};
