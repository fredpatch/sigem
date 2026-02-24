import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useCancelPurchase,
  useConfirmPurchase,
  usePurchase,
} from "../../hooks/use-purchasing";

function moneyXaf(n?: number) {
  const v = Number(n ?? 0);
  return `${v.toLocaleString("fr-FR")} FCFA`;
}

function fmtDateTime(d?: string) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(d?: string) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "CONFIRMED") return <Badge>Confirmé</Badge>;
  if (status === "DRAFT") return <Badge variant="secondary">Brouillon</Badge>;
  if (status === "CANCELLED")
    return <Badge variant="destructive">Annulé</Badge>;
  return <Badge variant="secondary">{status ?? "-"}</Badge>;
}

export const PurchasesPage = () => {
  return (
    <div className="p-4 text-sm text-muted-foreground">
      Sélectionnez un achat dans la liste ou créez-en un.
    </div>
  );
};

export const PurchaseDetailPage = () => {
  const { id } = useParams();
  const { openModal } = useModalStore();
  const [ConfirmDialog, confirm] = useConfirm();
  const confirmMut = useConfirmPurchase();

  const { data, isLoading } = usePurchase(id);
  const cancel = useCancelPurchase();

  //   console.log("Purchase detail data:", data);

  // --- normalize payload (support both shapes) ---
  const purchase = (data as any)?.purchase ?? data;
  const lines = (data as any)?.lines ?? purchase?.lines ?? [];

  const onConfirmPurchase = async () => {
    const ok = await confirm({
      title: "Confirmer cet achat ?",
      description:
        "Les totaux seront recalculés, et l'achat sera verrouillé (audit). Continuer ?",
      confirmText: "Oui, confirmer",
      cancelText: "Annuler",
      confirmVariant: "default",
      dangerIcon: false,
      loading: confirmMut.isPending,
      autoCloseDelay: 5000,
    });
    if (!ok) return;

    await confirmMut.mutateAsync(purchase.id);
    toast.success("Achat confirmé");
  };

  const canEdit = purchase?.status === "DRAFT";
  const canCancel =
    purchase?.status === "DRAFT" || purchase?.status === "CONFIRMED";

  const linesTotal = useMemo(() => {
    if (!Array.isArray(lines)) return 0;
    return lines.reduce(
      (sum: number, l: any) => sum + Number(l.lineTotal ?? 0),
      0
    );
  }, [lines]);

  if (!id) return null;

  const onEdit = () => openModal(ModalTypes.PURCHASE_FORM, purchase);

  const onCancel = async () => {
    const ok = await confirm({
      title: "Annuler cet achat ?",
      description:
        "L'achat sera marqué comme annulé. Cette action est irréversible.",
      confirmText: "Oui, annuler",
      cancelText: "Retour",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: cancel.isPending,
      autoCloseDelay: 5000,
    });

    if (!ok) return;

    await cancel.mutateAsync(purchase._id);
    toast.success("Achat annulé");
  };

  return (
    <div className="p-4 space-y-3">
      <ConfirmDialog />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">
            {isLoading
              ? "Chargement..."
              : purchase?.reference
                ? `Facture ${purchase.reference}`
                : "Détails achat"}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {purchase?.providerId?.name ?? "Fournisseur"} •{" "}
            {fmtDate(purchase?.date)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit ? (
            <>
              <Button
                onClick={onConfirmPurchase}
                disabled={confirmMut.isPending}
              >
                Confirmer
              </Button>
              <Button
                variant="secondary"
                onClick={onEdit}
                disabled={isLoading || !purchase}
              >
                Modifier
              </Button>
            </>
          ) : null}

          {canCancel ? (
            <Button
              variant="destructive"
              onClick={onCancel}
              disabled={isLoading || !purchase || cancel.isPending}
            >
              Annuler
            </Button>
          ) : null}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Statut</div>
            <div className="mt-1">
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <StatusBadge status={purchase?.status} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="mt-1 text-lg font-semibold">
              {isLoading ? (
                <Skeleton className="h-6 w-28" />
              ) : (
                moneyXaf(purchase?.total ?? purchase?.subtotal ?? linesTotal)
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Sous-total: {moneyXaf(purchase?.subtotal ?? linesTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Fournisseur</div>
            <div className="mt-1 font-medium truncate">
              {isLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                (purchase?.providerId?.name ?? "-")
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {purchase?.providerId?.designation ?? ""}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meta */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            {/* <div>
              <div className="text-xs text-muted-foreground">Département</div>
              <div className="text-sm">{purchase?.dept ?? "-"}</div>
            </div> */}

            <div>
              <div className="text-xs text-muted-foreground">Devise</div>
              <div className="text-sm">{purchase?.currency ?? "XAF"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Créé le</div>
              <div className="text-sm">{fmtDateTime(purchase?.createdAt)}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Mis à jour</div>
              <div className="text-sm">{fmtDateTime(purchase?.updatedAt)}</div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-xs text-muted-foreground">Notes</div>
            <div className="text-sm whitespace-pre-wrap">
              {purchase?.notes ?? "-"}
            </div>
          </div>

          {(purchase?.tags?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-2">
              {purchase.tags.map((t: string) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Lines */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">Lignes d’achat</div>
              <div className="text-xs text-muted-foreground">
                Snapshot conservé pour audit (libellé/code/type au moment de
                l’achat).
              </div>
            </div>
            <div className="text-sm font-semibold">{moneyXaf(linesTotal)}</div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ) : !Array.isArray(lines) || lines.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Aucune ligne enregistrée.
            </div>
          ) : (
            <div className="overflow-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="[&>th]:text-left [&>th]:text-xs [&>th]:text-muted-foreground [&>th]:font-medium [&>th]:px-3 [&>th]:py-2">
                    <th>Produit</th>
                    <th>Type</th>
                    <th>Qté</th>
                    <th>PU</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lines.map((l: any, idx: number) => (
                    <tr key={l.id ?? idx} className="[&>td]:px-3 [&>td]:py-2">
                      <td>
                        <div className="font-medium">
                          {l.labelSnapshot ?? l.product?.label ?? "-"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {l.codeSnapshot ?? l.product?.code ?? ""}
                        </div>
                        {l.notes ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            {l.notes}
                          </div>
                        ) : null}
                      </td>
                      <td className="text-muted-foreground">
                        {l.typeSnapshot ?? "-"}
                      </td>
                      <td>
                        {l.quantity ?? 0}
                        {l.unitSnapshot ? ` ${l.unitSnapshot}` : ""}
                      </td>
                      <td>{moneyXaf(l.unitPrice ?? 0)}</td>
                      <td className="font-semibold">
                        {moneyXaf(l.lineTotal ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
