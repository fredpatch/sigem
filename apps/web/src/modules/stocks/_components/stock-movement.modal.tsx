// src/features/stock/_components/stock-movement-modal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Package,
  Truck,
  Hash,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronsUpDown,
  Check,
  Search,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  useCreateStockMovement,
  useLookupSupplierPrice,
  useStockMovements,
} from "../hooks/use-stock";
import { useProvidersList } from "@/modules/providers/hooks/use-providers";
import { useSupplyItems } from "@/modules/supplier/hooks/supplies.queries";
import { Guidelines } from "@/common/guidelines";

export type StockMovementMode = "IN" | "OUT" | "ADJUST";

type FormValues = {
  supplyItemId?: string;

  qty?: number;
  countedQty?: number;

  providerId?: string;
  unitCost?: number;

  reason?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: StockMovementMode;
  locationId: string;

  supplyItemId?: string;
  onSuccess?: () => void;
};

export const StockMovementModal = ({
  open,
  onOpenChange,
  mode,
  locationId,
  supplyItemId,
  onSuccess,
}: Props) => {
  const [openSupplyCombo, setOpenSupplyCombo] = useState(false);
  const [openProviderCombo, setOpenProviderCombo] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      supplyItemId: supplyItemId ?? "",
      qty: 1,
      countedQty: undefined,
      providerId: "",
      unitCost: undefined,
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      supplyItemId: supplyItemId ?? "",
      qty: 1,
      countedQty: undefined,
      providerId: "",
      unitCost: undefined,
      reason: "",
    });
    setOpenSupplyCombo(false);
    setOpenProviderCombo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, supplyItemId, mode, locationId]);

  const createMut = useCreateStockMovement();

  const providersQ = useProvidersList({ active: true, limit: 200, page: 1 });
  const providers = (providersQ.data?.items ?? []) as any[];

  const supplyItemsQ = useSupplyItems({ active: true });
  const supplyItems = (supplyItemsQ.data?.items ?? []) as any[];

  const watchedItemId = form.watch("supplyItemId");
  const providerId = form.watch("providerId");
  const itemId = form.watch("supplyItemId");

  const lookupQ = useLookupSupplierPrice({
    supplierId: providerId,
    itemId,
    enabled: mode === "IN" && !!providerId && !!itemId,
  });

  const lastInQ = useStockMovements({
    locationId,
    supplyItemId: watchedItemId,
    type: "IN",
    page: 1,
    limit: 1,
  });

  // console.log("lastInQ", lastInQ.data?.items?.[0]);
  const lastProvider = lastInQ.data?.items?.[0]?.providerId;

  useEffect(() => {
    if (mode !== "IN") return;
    if (!watchedItemId) return;

    // if the last IN movement has a provider, preselect it
    if (lastProvider && !form.getValues("providerId")) {
      form.setValue("providerId", lastProvider._id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastInQ.data, mode, watchedItemId]);

  useEffect(() => {
    if (mode !== "IN") return;
    if (!lookupQ.data) return;

    if ("found" in lookupQ.data && lookupQ.data.found) {
      form.setValue("unitCost", lookupQ.data.unitPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupQ.data, mode]);

  // !form.getValues("providerId");

  const {
    title,
    icon: Icon,
    iconColor,
  } = useMemo(() => {
    if (mode === "IN")
      return {
        title: "Entrée en stock",
        icon: ArrowDownToLine,
        iconColor: "text-green-600 dark:text-green-500",
      };
    if (mode === "OUT")
      return {
        title: "Sortie de stock",
        icon: ArrowUpFromLine,
        iconColor: "text-red-600 dark:text-red-500",
      };
    return {
      title: "Ajustement inventaire",
      icon: RefreshCw,
      iconColor: "text-blue-600 dark:text-blue-500",
    };
  }, [mode]);

  const canSubmit = useMemo(() => {
    if (!locationId) return false;
    if (!watchedItemId) return false;

    if (mode === "IN" || mode === "OUT") {
      const q = Number(form.getValues("qty"));
      return Number.isFinite(q) && q > 0;
    }
    if (mode === "ADJUST") {
      const c = Number(form.getValues("countedQty"));
      return Number.isFinite(c) && c >= 0;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    locationId,
    watchedItemId,
    mode,
    form.watch("qty"),
    form.watch("countedQty"),
  ]);

  const showNoPrice =
    mode === "IN" && providerId && itemId && lookupQ.data?.found === false;

  const showPriceFound =
    mode === "IN" &&
    "found" in (lookupQ.data || {}) &&
    (lookupQ.data as any)?.found;

  const onSubmit = form.handleSubmit(async (v) => {
    if (!v.supplyItemId) return;

    const payload: any = {
      type: mode,
      locationId,
      supplyItemId: v.supplyItemId,
      reason: v.reason?.trim() ? v.reason.trim() : undefined,
    };

    if (mode === "IN" || mode === "OUT") payload.qty = Number(v.qty || 0);

    if (mode === "IN") {
      payload.providerId = v.providerId || undefined;
      payload.unitCost =
        typeof v.unitCost === "number" && Number.isFinite(v.unitCost)
          ? Number(v.unitCost)
          : undefined;
    }

    if (mode === "ADJUST") payload.countedQty = Number(v.countedQty || 0);

    await createMut.mutateAsync(payload);

    onSuccess?.();
    onOpenChange(false);
  });

  const isBusy =
    createMut.isPending ||
    (mode === "IN" && lookupQ?.isFetching) ||
    providersQ.isLoading ||
    supplyItemsQ.isLoading;

  const selectedSupplyItem = supplyItems.find(
    (item) => item._id === form.watch("supplyItemId"),
  );

  const selectedProvider = providers.find(
    (provider) => provider.id === form.watch("providerId"),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] gap-6">
        <DialogHeader className="space-y-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
              mode === "IN"
                ? "bg-green-100 dark:bg-green-950"
                : mode === "OUT"
                  ? "bg-red-100 dark:bg-red-950"
                  : "bg-blue-100 dark:bg-blue-950"
            }`}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <DialogTitle className="text-xl font-semibold text-center">
              {title}
            </DialogTitle>
          </motion.div>

          {/* Tips contextuels */}
          <div className="mt-2">
            {mode === "IN" && (
              <Guidelines
                compact
                variant="tips"
                title="Entrée : bonnes pratiques"
                items={[
                  "Choisis un fournisseur si possible (meilleure traçabilité).",
                  "Le prix unitaire peut être auto-rempli depuis la grille fournisseur.",
                  "Si aucun prix n’existe, tu peux le saisir manuellement (optionnel).",
                ]}
                showHelpLink={false}
              />
            )}

            {mode === "OUT" && (
              <Guidelines
                compact
                variant="warning"
                title="Sortie : attention"
                items={[
                  "Une sortie diminue le stock (delta négatif).",
                  "Si le stock est insuffisant, l’API bloque l’opération.",
                  "Ajoute un motif (service, urgence, projet) pour faciliter l’audit.",
                ]}
                showHelpLink={false}
              />
            )}

            {mode === "ADJUST" && (
              <Guidelines
                compact
                variant="info"
                title="Ajustement inventaire"
                items={[
                  "Tu saisis la quantité comptée (réalité).",
                  "Le système calcule delta = compté - stock actuel.",
                  "À utiliser après comptage (mensuel, trimestriel, contrôle).",
                ]}
                showHelpLink={false}
              />
            )}
          </div>
        </DialogHeader>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={onSubmit}
          className="space-y-5"
        >
          {/* Article combobox */}
          {!supplyItemId && (
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Article
              </label>
              <Popover open={openSupplyCombo} onOpenChange={setOpenSupplyCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSupplyCombo}
                    className="w-full h-11 justify-between font-normal"
                  >
                    {selectedSupplyItem ? (
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {selectedSupplyItem.label}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Sélectionner un article
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Rechercher un article..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 opacity-20" />
                          <p>Aucun article trouvé</p>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {supplyItems.map((item) => (
                          <CommandItem
                            key={item._id}
                            value={item.label}
                            onSelect={() => {
                              form.setValue("supplyItemId", item._id);
                              setOpenSupplyCombo(false);
                            }}
                            className="gap-2"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                form.watch("supplyItemId") === item._id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{item.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                  Astuce : tu peux aussi ouvrir l'action depuis une ligne de la
                  table.
                </span>
              </p>
            </div>
          )}

          {/* Pre-selected article info */}
          {supplyItemId && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 bg-muted/50 rounded-lg p-3.5 border"
            >
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Article</div>
                <div className="font-medium truncate">
                  {stockLabelFromList(supplyItems, supplyItemId) ??
                    "Sélectionné"}
                </div>
              </div>
            </motion.div>
          )}

          {/* IN mode fields */}
          {mode === "IN" && (
            <div className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  Fournisseur
                </label>
                <Popover
                  open={openProviderCombo}
                  onOpenChange={setOpenProviderCombo}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProviderCombo}
                      className="w-full h-11 justify-between font-normal"
                    >
                      {selectedProvider ? (
                        <span className="flex items-center gap-2">
                          {/* <Truck className="h-4 w-4 text-muted-foreground" /> */}
                          {selectedProvider.name ||
                            selectedProvider.label ||
                            "Fournisseur"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Sélectionner un fournisseur
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Rechercher un fournisseur..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 opacity-20" />
                            <p>Aucun fournisseur trouvé</p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {providers.map((provider) => (
                            <CommandItem
                              key={provider.id}
                              value={
                                provider.name || provider.label || "Fournisseur"
                              }
                              onSelect={() => {
                                form.setValue("providerId", provider.id);
                                setOpenProviderCombo(false);
                              }}
                              className="gap-2"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  form.watch("providerId") === provider.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {/* <Truck className="h-4 w-4 text-muted-foreground" /> */}
                              <span>
                                {provider.name ||
                                  provider.label ||
                                  "Fournisseur"}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <AnimatePresence mode="wait">
                  {showNoPrice && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-start gap-2 text-xs bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-md p-2.5 text-orange-700 dark:text-orange-400"
                    >
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <p>
                        Aucun prix trouvé pour ce fournisseur. Vous pouvez
                        saisir un prix manuellement.
                      </p>
                    </motion.div>
                  )}

                  {mode === "IN" &&
                    providerId &&
                    itemId &&
                    lookupQ.isFetching && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Recherche du prix fournisseur…</span>
                      </motion.div>
                    )}
                  {lastInQ.data?.items?.[0]?.providerId && (
                    <div className="text-xs text-orange-700 dark:text-orange-400 flex items-start gap-1.5">
                      Fournisseur pré-rempli depuis la dernière réception.
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <label
                    htmlFor="qty"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Quantité
                  </label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    className="h-11"
                    {...form.register("qty", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2.5">
                  <label
                    htmlFor="unitCost"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Prix unitaire
                  </label>
                  <Input
                    id="unitCost"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Optionnel"
                    className="h-11"
                    {...form.register("unitCost", { valueAsNumber: true })}
                  />
                  <AnimatePresence>
                    {showPriceFound && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Prix auto depuis la grille fournisseur</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* OUT mode fields */}
          {mode === "OUT" && (
            <div className="space-y-2.5">
              <label
                htmlFor="qty-out"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-muted-foreground" />
                Quantité
              </label>
              <Input
                id="qty-out"
                type="number"
                min={1}
                className="h-11 max-w-[240px]"
                {...form.register("qty", { valueAsNumber: true })}
              />
            </div>
          )}

          {/* ADJUST mode fields */}
          {mode === "ADJUST" && (
            <div className="space-y-2.5">
              <label
                htmlFor="countedQty"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-muted-foreground" />
                Quantité comptée
              </label>
              <Input
                id="countedQty"
                type="number"
                min={0}
                className="h-11 max-w-[240px]"
                {...form.register("countedQty", { valueAsNumber: true })}
              />
            </div>
          )}

          {/* Reason field */}
          <div className="space-y-2.5">
            <label
              htmlFor="reason"
              className="text-sm font-medium flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              Motif
              <span className="text-xs text-muted-foreground font-normal">
                (optionnel)
              </span>
            </label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="Ex: Inventaire mensuel, réception, casse…"
              className="resize-none"
              {...form.register("reason")}
            />
          </div>

          {/* Footer buttons */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-3 pt-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
              className="min-w-[100px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isBusy}
              className="min-w-[120px] relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isBusy ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enregistrement</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="submit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Valider
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

// helper: find label quickly when supplyItemId preselected
function stockLabelFromList(list: any[], id: string) {
  return list.find((x) => x._id === id)?.label;
}
