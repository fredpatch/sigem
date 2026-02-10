// src/features/stock/_components/stock-minlevel-modal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, TrendingDown, Package, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetStockMinLevel } from "../hooks/use-stock";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  locationId: string;
  supplyItemId: string;

  currentMinLevel?: number;
  supplyItemLabel?: string;

  onSuccess?: () => void;
};

type FormValues = { minLevel: number };

export const StockMinLevelModal = ({
  open,
  onOpenChange,
  locationId,
  supplyItemId,
  currentMinLevel,
  supplyItemLabel,
  onSuccess,
}: Props) => {
  const mut = useSetStockMinLevel();

  const form = useForm<FormValues>({
    defaultValues: { minLevel: Number(currentMinLevel ?? 0) },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ minLevel: Number(currentMinLevel ?? 0) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentMinLevel]);

  const submit = form.handleSubmit(async (v) => {
    await mut.mutateAsync({
      locationId,
      supplyItemId,
      minLevel: Number(v.minLevel ?? 0),
    });
    onSuccess?.();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] gap-6">
        <DialogHeader className="space-y-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <TrendingDown className="h-6 w-6 text-primary" />
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <DialogTitle className="text-xl font-semibold text-center">
              Définir le seuil minimum
            </DialogTitle>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3"
          >
            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex items-baseline gap-2 flex-1 min-w-0">
              <span className="text-muted-foreground flex-shrink-0">
                Article :
              </span>
              <span className="font-medium text-foreground truncate">
                {supplyItemLabel ?? "—"}
              </span>
            </div>
          </motion.div>
        </DialogHeader>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={submit}
          className="space-y-6"
        >
          <div className="space-y-2.5">
            <label
              htmlFor="minLevel"
              className="text-sm font-medium leading-none flex items-center gap-2"
            >
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              Seuil minimum
            </label>
            <div className="relative">
              <Input
                id="minLevel"
                type="number"
                min={0}
                placeholder="0"
                className="h-11 pl-3 pr-3"
                {...form.register("minLevel", { valueAsNumber: true })}
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-md p-2.5"
            >
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <p className="leading-relaxed">
                Une alerte "Sous seuil" sera déclenchée si la quantité est
                inférieure ou égale à ce seuil.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-3 pt-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mut.isPending}
              className="min-w-[100px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={mut.isPending}
              className="min-w-[120px] relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {mut.isPending ? (
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
                    Enregistrer
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
