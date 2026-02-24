import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useVehicles } from "../../hooks/use-vehicle";
import { Vehicle } from "../../types/vehicle.types";

export const updateMileageSchema = z.object({
  currentMileage: z.coerce
    .number()
    .nonnegative("Kilométrage invalide")
    .finite("Kilométrage invalide"),
  mileageUpdatedAt: z.string().optional(), // YYYY-MM-DD
});

export type UpdateMileageFormValues = z.infer<typeof updateMileageSchema>;

const toYmd = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

export const VehicleUpdateMileageModal = () => {
  const { name, data, closeModal } = useModalStore();
  const open = name === ModalTypes.VEHICLE_UPDATE_MILEAGE;

  const vehicle = (data as Vehicle | undefined) ?? undefined;

  // ✅ ton hook mutation
  const { updateMileage } = useVehicles(); // <- adapte selon ton hook
  // ex: const { mutateAsync, isPending } = updateMileage;
  const { mutateAsync, isPending } = updateMileage;

  const label = useMemo(() => {
    if (!vehicle) return "";
    const l = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");
    return `${l} · ${vehicle.plateNumber ?? ""}`.trim();
  }, [vehicle]);

  const form = useForm<UpdateMileageFormValues>({
    resolver: zodResolver(updateMileageSchema),
    defaultValues: {
      currentMileage: vehicle?.currentMileage ?? 0,
      mileageUpdatedAt: toYmd(vehicle?.mileageUpdatedAt as any), // si tu l’as
    },
    values: vehicle
      ? {
          currentMileage: vehicle.currentMileage ?? 0,
          mileageUpdatedAt: toYmd(vehicle.mileageUpdatedAt as any),
        }
      : undefined,
  });

  const onSubmit = async (values: UpdateMileageFormValues) => {
    if (!vehicle?.id) return;

    await mutateAsync({
      id: vehicle.id,
      payload: {
        currentMileage: values.currentMileage,
        mileageUpdatedAt: values.mileageUpdatedAt
          ? new Date(`${values.mileageUpdatedAt}T00:00:00`).toISOString()
          : undefined,
      },
    });

    closeModal();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Mettre à jour le kilométrage</DialogTitle>
          <p className="text-sm text-muted-foreground">{label}</p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Kilométrage actuel</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex: 124500"
              {...form.register("currentMileage")}
            />
            {form.formState.errors.currentMileage && (
              <p className="text-xs text-red-500">
                {form.formState.errors.currentMileage.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date de mise à jour (optionnel)</Label>
            <Input type="date" {...form.register("mileageUpdatedAt")} />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
