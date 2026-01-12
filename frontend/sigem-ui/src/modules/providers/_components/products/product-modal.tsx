import { Guidelines } from "@/common/guidelines";
import { ReusableForm } from "@/components/shared/form/form.component";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useMemo } from "react";
import {
  ProductCreateInput,
  ProductCreateSchema,
  productDefaultValues,
  ProductUpdateInput,
  ProductUpdateSchema,
} from "../../schema/product.schema";
import { Product } from "../../types/purchasing.types";
import { useCreateProduct, useUpdateProduct } from "../../hooks/use-purchasing";
import { toast } from "sonner";
import { ProductForm } from "./product-form";

function tagsToText(tags?: string[]) {
  return (tags ?? []).join(", ");
}

function parseTagsText(input?: string) {
  return (input ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const ProductModal = () => {
  const { data, name } = useModalStore();
  const isEdit = Boolean(data?.id);

  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useUpdateProduct();
  const [ConfirmDialog, confirm] = useConfirm();

  const pending = isPending || isUpdating;

  console.log("ProductModal data:", data);

  const normalizedDefaults = useMemo(() => {
    if (!isEdit || !data) {
      return {
        ...productDefaultValues,
        tagsText: "",
      };
    }

    const d = data as Product;

    return {
      ...productDefaultValues,
      ...d,
      unit: d.unit ?? "",
      tags: d.tags ?? [],
      tagsText: tagsToText(d.tags),
    };
  }, [isEdit, data]);

  const handleCreate = async (
    values: ProductCreateInput & { tagsText?: string }
  ) => {
    await createProduct({
      ...values,
      tags: parseTagsText(values.tagsText),
    });
    toast.success("Produit créé");
  };

  const handleUpdate = async (
    values: ProductUpdateInput & { tagsText?: string }
  ) => {
    const ok = await confirm({
      title: "Mettre à jour le produit ?",
      description:
        "Vous êtes sur le point de modifier les informations du produit. Continuer ?",
      confirmText: "Oui",
      cancelText: "Annuler",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: pending,
      autoCloseDelay: 5000,
    });

    if (!ok) return;

    await updateProduct({
      id: (data as Product).id,
      body: { ...values, tags: parseTagsText(values.tagsText) },
    });

    toast.success("Produit mis à jour");
  };

  if (name !== ModalTypes.PRODUCT_FORM) return null;
  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        className="md:min-w-[800px] xs:min-w-[400px] p-4"
        title={isEdit ? "Modifier le produit" : "Enregistrer un produit"}
        description="Veuillez remplir le formulaire ci-dessous pour enregistrer le produit."
        classNameDescription="text-[0.75rem] -mt-1 text-muted-foreground"
      >
        <Guidelines
          className="mb-4 -mt-2"
          variant="tips"
          compact
          title="Conseils"
          items={[
            "Utilisez un libellé clair (ex: Chaise visiteur, Agrafes n10).",
            "Choisissez un type cohérent (Consommable, Mobilier, Équipement).",
            "Ajoutez des tags pour faciliter la recherche (séparés par des virgules).",
          ]}
        />
        <ReusableForm
          id={isEdit}
          schema={isEdit ? ProductUpdateSchema : ProductCreateSchema}
          defaultValues={normalizedDefaults as any}
          onSubmit={isEdit ? (handleUpdate as any) : (handleCreate as any)}
          disabled={pending}
          renderFields={(form) => (
            <ProductForm id={isEdit} form={form as any} />
          )}
        />
      </GenericFormModal>
    </>
  );
};
