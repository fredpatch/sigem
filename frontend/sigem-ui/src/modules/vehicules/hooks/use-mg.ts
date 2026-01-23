import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MgCreateVehiclePayload,
  MgUpdateVehicleOilChangeDTO,
} from "../types/mg.types";
import { VehicleAPI } from "../api/vehicle.api";
import { toast } from "sonner";
import { useModalStore } from "@/stores/modal-store";

export const useCompleteMgOilChange = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      vehicleId: string;
      payload: MgUpdateVehicleOilChangeDTO;
    }) => {
      const { vehicleId, payload } = params;
      return await VehicleAPI.updateMgMileage(vehicleId, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.message ?? "Vidange validée.");
      // IMPORTANT: invalider la table MG
      qc.invalidateQueries({ queryKey: ["vehicles", "mg-table"] });
      // si tu as aussi des widgets/alerts:
      qc.invalidateQueries({ queryKey: ["vehicle-tasks"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Impossible de valider la vidange.";
      toast.error(msg);
    },
  });
};

export const useMgCreateVehicle = () => {
  const qc = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation({
    mutationKey: ["mg-create-vehicle"],
    mutationFn: async (payload: MgCreateVehiclePayload) => {
      return await VehicleAPI.mgCreateVehicle(payload);
    },
    onSuccess: (res) => {
      toast.success(res?.message ?? "Véhicule créé avec succès.");
      qc.invalidateQueries({ queryKey: ["vehicles", "mg-table"] });
      closeModal();
    },
  });
};
