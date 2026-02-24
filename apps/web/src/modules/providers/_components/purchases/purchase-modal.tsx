import { useConfirm } from "@/hooks/use-confirm";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { Guidelines } from "@/common/guidelines";
import { ReusableForm } from "@/components/shared/form/form.component";
import { toast } from "sonner";
import {
  useCreatePurchase,
  usePurchase,
  useUpdatePurchase,
} from "../../hooks/use-purchasing";
import {
  PurchaseCreateInput,
  PurchaseCreateSchema,
  purchaseDefaultValues,
  PurchaseUpdateInput,
  PurchaseUpdateSchema,
} from "../../schema/purchase.schema";
import { PurchaseForm } from "./purchase-form";
import { useMemo } from "react";

function normalizePurchaseToForm(p: any) {
  // p peut être { purchase, lines } ou un purchase direct
  const purchase = p?.purchase ?? p;
  const lines = p?.lines ?? purchase?.lines ?? [];

  return {
    ...purchaseDefaultValues,
    providerId: String(purchase?.providerId?.id ?? purchase?.providerId ?? ""),
    date: purchase?.date
      ? new Date(purchase.date).toISOString().slice(0, 10)
      : purchaseDefaultValues.date,
    // status: purchase?.status ?? purchaseDefaultValues.status,
    reference: purchase?.reference ?? "",
    notes: purchase?.notes ?? "",
    // tags si tu veux les exposer dans le form (sinon ignore)
    tags: purchase?.tags ?? [],
    lines:
      Array.isArray(lines) && lines.length
        ? lines.map((l: any) => ({
            productId: String(l.productId?.id ?? l.productId ?? ""),
            quantity: Number(l.quantity ?? 0),
            unitPrice: Number(l.unitPrice ?? 0),
            notes: l.notes ?? "",
          }))
        : purchaseDefaultValues.lines,
  };
}

export const PurchaseModal = () => {
  const { name, data } = useModalStore();
  const isEdit = Boolean(data?._id);
  const purchaseId = isEdit ? data._id : undefined;
  const [ConfirmDialog, confirm] = useConfirm();

  const { mutateAsync: createPurchase, isPending } = useCreatePurchase();
  const { mutateAsync: updatePurchase, isPending: isUpdating } =
    useUpdatePurchase();
  const { data: purchaseDetail, isLoading: isLoadingDetail } =
    usePurchase(purchaseId);

  //   console.log("PurchaseModal data:", data._id, data);

  const pending = isPending || isUpdating;
  const disabled = pending || (isEdit && isLoadingDetail);

  const normalizedDefaults = useMemo(() => {
    if (!isEdit) return purchaseDefaultValues;

    // Priorité: detail fetch (contient lines) > data modal
    const src = purchaseDetail ?? data;
    return normalizePurchaseToForm(src);
  }, [isEdit, purchaseDetail, data]);

  const handleCreate = async (values: PurchaseCreateInput) => {
    await createPurchase({ ...values, status: "DRAFT" }); // safe
    toast.success("Brouillon enregistré");
  };

  const handleUpdate = async (values: PurchaseUpdateInput) => {
    // Option de sécurité : empêcher update si not DRAFT
    const currentStatus =
      (purchaseDetail as any)?.purchase?.status ??
      (purchaseDetail as any)?.status ??
      (data as any)?.status;

    if (currentStatus && currentStatus !== "DRAFT") {
      toast.error("Seuls les achats en brouillon peuvent être modifiés.");
      return;
    }

    const ok = await confirm({
      title: "Mettre à jour l'achat ?",
      description: "Vous êtes sur le point de modifier cet achat. Continuer ?",
      confirmText: "Oui",
      cancelText: "Annuler",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: pending,
      autoCloseDelay: 5000,
    });

    if (!ok) return;

    await updatePurchase({ id: purchaseId!, body: values }); // sans status
    toast.success("Brouillon mis à jour");
  };

  if (name !== ModalTypes.PURCHASE_FORM) return null;

  return (
    <>
      <ConfirmDialog />
      <GenericFormModal
        className="md:min-w-[900px] xs:min-w-[420px] p-4"
        title={isEdit ? "Modifier un achat" : "Enregistrer un achat"}
        description="Saisissez les informations de l'achat et les lignes produits."
        classNameDescription="text-[0.75rem] -mt-1 text-muted-foreground"
      >
        <Guidelines
          className="mb-4 -mt-2"
          variant="tips"
          compact
          title="Conseils"
          items={[
            "Choisissez le fournisseur avant d'ajouter les lignes.",
            "Saisissez les prix unitaires réels (facture).",
            "Laissez en brouillon si l'achat n'est pas finalisé.",
            isEdit ? "Un achat confirmé ne doit pas être modifié (audit)." : "",
          ].filter(Boolean)}
        />

        <ReusableForm
          id={isEdit}
          schema={isEdit ? PurchaseUpdateSchema : PurchaseCreateSchema}
          defaultValues={normalizedDefaults as any}
          onSubmit={isEdit ? (handleUpdate as any) : (handleCreate as any)}
          disabled={disabled}
          renderFields={(form) => <PurchaseForm form={form as any} />}
        />
      </GenericFormModal>
    </>
  );
};
