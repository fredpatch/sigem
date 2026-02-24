import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { MGMaintenanceRow } from "../../types/mg.types";
import { useCompleteMgOilChange } from "../../hooks/use-mg";

const Schema = z.object({
  completedMileage: z.coerce.number().min(0, "Le kilométrage est requis"),
  completedAt: z.string().optional(), // "YYYY-MM-DD"
  completionComment: z.string().optional(),
});
type FormValues = z.infer<typeof Schema>;

function toIsoFromDateInput(v?: string) {
  if (!v) return undefined;
  // date input => YYYY-MM-DD
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function VehicleCompleteOilChangeModal() {
  const { name, closeModal, selectedItem } = useModalStore();
  const open = name === ModalTypes.VEHICLE_COMPLETE_OIL_CHANGE;

  const vehicle = selectedItem as MGMaintenanceRow | null;

  const complete = useCompleteMgOilChange();

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      completedMileage: vehicle?.nextOilChangeKm ?? undefined,
      completedAt: format(new Date(), "yyyy-MM-dd"),
      completionComment: "",
    },
    values: {
      completedMileage: (vehicle?.nextOilChangeKm ?? undefined) as any,
      completedAt: format(new Date(), "yyyy-MM-dd"),
      completionComment: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    // preset intelligent: mettre nextOilChangeKm si dispo, sinon vide
    form.reset({
      completedMileage: (vehicle?.nextOilChangeKm ?? undefined) as any,
      completedAt: format(new Date(), "yyyy-MM-dd"),
      completionComment: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle?.id]);

  const onSubmit = async (values: FormValues) => {
    if (!vehicle?.id) return;

    await complete.mutateAsync({
      vehicleId: vehicle.id,
      payload: {
        completedMileage: values.completedMileage,
        completedAt: toIsoFromDateInput(values.completedAt),
        completionComment: values.completionComment?.trim() || undefined,
      },
    });

    closeModal();
  };

  const label = vehicle
    ? `${vehicle.plateNumber} · ${[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}`
    : "Véhicule";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Valider une vidange</DialogTitle>
          <p className="text-sm text-muted-foreground">{label}</p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Kilométrage au moment de la vidange</Label>
            <Input
              type="number"
              placeholder="Ex: 124500"
              {...form.register("completedMileage")}
            />
            {form.formState.errors.completedMileage && (
              <p className="text-xs text-red-500">
                {form.formState.errors.completedMileage.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...form.register("completedAt")} />
          </div>

          <div className="space-y-2">
            <Label>Commentaire (optionnel)</Label>
            <Textarea
              rows={3}
              placeholder="Ex: Vidange + filtre"
              {...form.register("completionComment")}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => closeModal()}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={complete.isPending}>
              {complete.isPending ? "Validation..." : "Valider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
