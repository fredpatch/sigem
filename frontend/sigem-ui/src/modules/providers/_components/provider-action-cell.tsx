import { useConfirm } from "@/hooks/use-confirm";
import { Row } from "@tanstack/react-table";
import {
  useActivateProvider,
  useDisableProvider,
} from "../hooks/use-providers";
import { useModalStore } from "@/stores/modal-store";
import { ActionTable } from "@/components/shared/table/action.component";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import { Provider } from "../types/types";
import { ModalTypes } from "@/types/modal.types";

interface ProviderProps {
  row: Row<Provider>;
}

export function ProviderActionCell({ row }: ProviderProps) {
  const [ConfirmDialog, confirm] = useConfirm();
  const { setSelectedItem, openModal } = useModalStore();
  const disable = useDisableProvider();
  const activate = useActivateProvider();

  const isActive = row.original.isActive;

  const handleToggle = async () => {
    const item = row.original;

    const ok = await confirm({
      title: isActive
        ? "Désactiver le fournisseur ?"
        : "Réactiver le fournisseur ?",
      description: isActive
        ? "Ce fournisseur ne sera plus utilisable dans les sélections."
        : "Ce fournisseur redeviendra utilisable dans les sélections.",
      confirmText: isActive ? "Oui, désactiver" : "Oui, réactiver",
      cancelText: "Annuler",
      confirmVariant: isActive ? "destructive" : "default",
      dangerIcon: isActive,
      loading: disable.isPending, // ou toggle.isPending
      autoCloseDelay: 5000,
    });

    if (!ok) return;

    await (isActive
      ? disable.mutateAsync(item.id)
      : activate.mutateAsync(item.id));
  };

  const handleEdit = () => {
    const doc = row.original;
    setSelectedItem(doc);
    openModal(ModalTypes.PROVIDERS_FORM, doc);
  };

  return (
    <>
      <ConfirmDialog />
      <ActionTable
        row={row}
        actions={[
          {
            label: isActive ? "Retirer" : "Restaurer le fournisseur",
            variant: isActive ? "destructive" : "secondary",
            onClick: handleToggle,
            icon: isActive ? (
              <Ban className="h-4 w-4" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            ),
          },
          {
            label: "Modifier les informations du fournisseur",
            variant: "outline",
            onClick: handleEdit,
            icon: <Pencil className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
}
