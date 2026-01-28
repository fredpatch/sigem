import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  suppliesKeys,
  useAutoPricePlan,
  useChangePlanStatus,
  useSupplyItems,
  useUpdateSupplyPlan,
} from "../hooks/supplies.queries";
import { ProviderSelect } from "../_components/ProviderSelect";
import { Guidelines } from "@/common/guidelines";
import {
  allowedNextStatuses,
  SupplyPlanStatus,
} from "../hooks/supply-plan.transitions";
import {
  SUPPLY_STATUS_LABEL_FR,
  SUPPLY_STATUS_VARIANT,
  toSupplyPlanStatus,
} from "../supply-status.fr";
import {
  Sparkles,
  Save,
  Trash2,
  Plus,
  ShoppingCart,
  TrendingUp,
  Package,
  Building2,
  Hash,
  DollarSign,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ItemSelect } from "./ItemSelect";
import { AnimatePresence, motion } from "framer-motion";
import {
  buttonVariants,
  itemVariants,
  successVariants,
} from "@/common/constant";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PlanDrawer({
  plan,
  open,
  onOpenChange,
}: {
  plan: any | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const itemsQ = useSupplyItems("");
  const updatePlan = useUpdateSupplyPlan();
  const autoPrice = useAutoPricePlan();
  const changeStatus = useChangePlanStatus();
  const nextStatuses = allowedNextStatuses(plan?.status as SupplyPlanStatus);
  const [publierPrixFournisseur, setPublierPrixFournisseur] = useState(false);

  const [lines, setLines] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLines(plan?.lines || []);
  }, [plan?._id, plan?.updatedAt]);

  useEffect(() => {
    const hasManualPrice = lines.some(
      (l) => l.selectedSupplierId && l.selectedUnitPrice != null,
    );
    if (hasManualPrice) setPublierPrixFournisseur(true);
  }, [lines]);

  const items = useMemo(
    () =>
      itemsQ.data?.items ??
      itemsQ.data?.data?.items ??
      itemsQ.data?.items?.items ??
      [],
    [itemsQ.data],
  );

  const addLine = () => {
    const first = items?.[0];
    if (!first) return;

    setLines((prev) => [
      ...prev,
      {
        itemId: first._id,
        labelSnapshot: first.label,
        unitSnapshot: first.unit ?? null,
        quantity: 1,
        selectedSupplierId: null,
        selectedUnitPrice: null,
      },
    ]);
  };

  const save = async () => {
    if (!plan?._id) return;

    await updatePlan.mutateAsync({
      id: plan._id,
      body: { lines, publishSupplierPrices: publierPrixFournisseur },
    });

    // refresh plan
    qc.invalidateQueries({ queryKey: [...suppliesKeys.plans, plan._id] });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAutoPrice = async () => {
    if (!plan?._id) return;

    // 1) sauvegarder les lignes locales (pour que le backend les connaisse)
    await updatePlan.mutateAsync({ id: plan._id, body: { lines } });

    // 2) lancer auto-price
    await autoPrice.mutateAsync(plan._id);

    // 3) optionnel: si tes hooks invalident déjà le detail, pas besoin.
    qc.invalidateQueries({ queryKey: [...suppliesKeys.plans, plan._id] });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const computeLineTotal = (l: any) => {
    const qty = Number(l.quantity ?? 0);
    const price = Number(l.selectedUnitPrice ?? 0);
    if (!Number.isFinite(qty) || !Number.isFinite(price)) return 0;
    return Math.max(0, qty) * Math.max(0, price);
  };

  const uiTotal = useMemo(() => {
    return lines.reduce((sum, l) => sum + computeLineTotal(l), 0);
  }, [lines]);

  const status = toSupplyPlanStatus(plan?.status);

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-6xl p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-linear-to-br from-background to-muted/20 border-b">
          <DialogTitle className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">{plan.reference}</span>
                <span className="text-xs text-muted-foreground">
                  Plan d'approvisionnement
                </span>
              </div>
              <Badge
                className="py-1 px-3 rounded-full text-xs font-medium"
                variant={SUPPLY_STATUS_VARIANT[status]}
              >
                {SUPPLY_STATUS_LABEL_FR[status]}
              </Badge>
            </motion.div>

            {/* Success indicator */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  variants={successVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2 text-green-600"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Enregistré !</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2 mr-4">
              <Switch
                checked={publierPrixFournisseur}
                onCheckedChange={setPublierPrixFournisseur}
              />
              <div className="min-w-0">
                <Label className="text-sm font-medium">
                  Mettre à jour la grille des prix fournisseur
                </Label>
                <p className="text-xs text-muted-foreground">
                  Activez uniquement si ce prix correspond au tarif “référence”
                  du fournisseur.
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Action buttons */}
          <motion.div
            className="flex justify-between gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="default"
                onClick={handleAutoPrice}
                disabled={autoPrice.isPending || updatePlan.isPending}
                className="gap-2 shadow-sm"
              >
                {autoPrice.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Prix automatique
              </Button>
            </motion.div>

            <div className="flex gap-2">
              {nextStatuses.map((st, idx) => (
                <motion.div
                  key={st}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Button
                    variant={st === "CANCELLED" ? "destructive" : "outline"}
                    onClick={() =>
                      changeStatus.mutate({ id: plan._id, to: st })
                    }
                    disabled={changeStatus.isPending}
                    className="gap-2"
                  >
                    {SUPPLY_STATUS_LABEL_FR[st]}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Table header */}
          <motion.div
            className="rounded-lg border bg-muted/30 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/50">
              <div className="col-span-3 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Article
              </div>
              <div className="col-span-3 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Fournisseur
              </div>
              <div className="col-span-1 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Qté
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Prix unitaire
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Total ligne
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Scrollable content */}
            <div className="max-h-[48vh] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {lines.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    Aucune ligne. Cliquez sur "+ Ajouter une ligne" pour
                    commencer.
                  </motion.div>
                ) : (
                  lines.map((l, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="grid grid-cols-12 gap-3 px-4 py-3 text-sm border-t items-center hover:bg-muted/20 transition-colors group"
                    >
                      {/* ARTICLE */}
                      <div className="col-span-3">
                        <ItemSelect
                          items={items}
                          value={l.itemId}
                          onChange={(id) => {
                            const it = items.find(
                              (x: any) => String(x._id) === String(id),
                            );
                            setLines((prev) =>
                              prev.map((p, i) =>
                                i === idx
                                  ? {
                                      ...p,
                                      itemId: id,
                                      labelSnapshot:
                                        it?.label ?? p.labelSnapshot,
                                      unitSnapshot: it?.unit ?? null,
                                    }
                                  : p,
                              ),
                            );
                          }}
                          disabled={!items.length}
                        />
                      </div>

                      {/* FOURNISSEUR */}
                      <div className="col-span-3">
                        <ProviderSelect
                          value={l.selectedSupplierId ?? null}
                          onChange={(id) => {
                            setLines((prev) =>
                              prev.map((p, i) =>
                                i === idx
                                  ? { ...p, selectedSupplierId: id }
                                  : p,
                              ),
                            );
                          }}
                          placeholder="Sélectionner..."
                          onlyType="FOURNISSEUR"
                        />
                      </div>

                      {/* QUANTITÉ */}
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min={0}
                          value={l.quantity}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setLines((prev) =>
                              prev.map((p, i) =>
                                i === idx ? { ...p, quantity: v } : p,
                              ),
                            );
                          }}
                          className="text-center"
                        />
                      </div>

                      {/* PRIX */}
                      <div className="col-span-2">
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={l.selectedUnitPrice ?? ""}
                            onChange={(e) => {
                              const v =
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value);
                              setLines((prev) =>
                                prev.map((p, i) =>
                                  i === idx
                                    ? { ...p, selectedUnitPrice: v }
                                    : p,
                                ),
                              );
                            }}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            XAF
                          </span>
                        </div>
                      </div>

                      {/* TOTAL */}
                      <div className="col-span-2">
                        <div className="px-3 py-2 rounded-md bg-muted/40 text-right">
                          <div className="text-xs text-muted-foreground mb-0.5">
                            Total
                          </div>
                          <div className="font-semibold text-sm">
                            {computeLineTotal(l).toLocaleString()} XAF
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}
                      <div className="col-span-1 flex justify-end">
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setLines((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Footer actions */}
          <motion.div
            className="flex items-center justify-between pt-4 border-t"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="outline"
                onClick={addLine}
                disabled={!items.length}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une ligne
              </Button>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* Total display */}
              <motion.div
                className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/20"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-xs text-muted-foreground mb-0.5">
                  Total estimé
                </div>
                <div className="text-lg font-bold text-primary">
                  {uiTotal.toLocaleString()} XAF
                </div>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="tertiary"
                  onClick={() => onOpenChange(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Fermer
                </Button>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={save}
                  disabled={updatePlan.isPending}
                  className="gap-2 shadow-sm"
                >
                  {updatePlan.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Info text */}
          <motion.div
            className="text-xs text-muted-foreground text-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Le total final sera recalculé après sauvegarde
          </motion.div>
        </div>

        {/* Guidelines section */}
        <motion.div
          className="px-6 pb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Guidelines
            variant="tips"
            compact
            title="Astuces"
            items={[
              "Ajoutez des lignes uniquement si le catalogue d'articles est renseigné.",
              "Laissez le prix vide et utilisez 'Prix automatique' si vous avez déjà des prix fournisseurs.",
              "Une fois terminé, évitez de modifier pour conserver l'historique.",
            ]}
            showHelpLink={false}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
