// src/features/vehicles/hooks/use-vehicles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateVehicleDTO,
  ListVehiclesQuery,
  UpdateVehicleDTO,
  UpdateVehicleMileageDTO,
} from "../types/vehicle.types";
import { VehicleAPI } from "../api/vehicle.api";
import { useModalStore } from "@/stores/modal-store";

// import { toast } from "sonner"; // si tu veux des toasts

const VEHICLES_KEY = "vehicles";

export function useVehicles(id?: string, listParams?: ListVehiclesQuery) {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  // LIST (paginated)
  const list = useQuery({
    queryKey: [VEHICLES_KEY, "list", listParams],
    queryFn: () => VehicleAPI.list(listParams),
  });

  // MG TABLE
  const mgTable = useQuery({
    queryKey: [VEHICLES_KEY, "mg-table"],
    queryFn: () => VehicleAPI.getMgTable(),
  });

  // SIMPLE LIST ACTIVE (pratique pour les selects)
  const listActive = useQuery({
    queryKey: [VEHICLES_KEY, "active"],
    queryFn: () => VehicleAPI.listAllActive(),
  });

  const myVehicle = useQuery({
    queryKey: ["vehicles", "my"],
    queryFn: () => VehicleAPI.getMyVehicles(),
  });

  // GET BY ID
  const listById = useQuery({
    queryKey: [VEHICLES_KEY, id],
    queryFn: () => VehicleAPI.getById(id!),
    enabled: !!id,
  });

  // CREATE
  const create = useMutation({
    mutationKey: [VEHICLES_KEY, "create"],
    mutationFn: (payload: CreateVehicleDTO) => VehicleAPI.create(payload),
    onSuccess: () => {
      // toast.success("Véhicule créé avec succès");
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      closeModal();
    },
    // onError: () => toast.error("Erreur lors de la création du véhicule"),
  });

  // UPDATE
  const update = useMutation({
    mutationKey: [VEHICLES_KEY, "update"],
    mutationFn: (data: { id: string; payload: UpdateVehicleDTO }) =>
      VehicleAPI.update(data.id, data.payload),
    onSuccess: (_, vars) => {
      // toast.success("Véhicule mis à jour");
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY, vars.id] });
      closeModal();
    },
    // onError: () => toast.error("Erreur lors de la mise à jour du véhicule"),
  });

  // UPDATE MILEAGE
  const updateMileage = useMutation({
    mutationKey: [VEHICLES_KEY, "updateMileage"],
    mutationFn: (data: { id: string; payload: UpdateVehicleMileageDTO }) =>
      VehicleAPI.updateMileage(data.id, data.payload),
    onSuccess: (_, vars) => {
      // toast.success("Kilométrage mis à jour");
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY, vars.id] });
      closeModal();
    },
    // onError: () => toast.error("Erreur lors de la mise à jour du kilométrage"),
  });

  // DELETE (soft delete)
  const softDelete = useMutation({
    mutationKey: [VEHICLES_KEY, "delete"],
    mutationFn: (id: string) => VehicleAPI.softDelete(id),
    onSuccess: () => {
      // toast.success("Véhicule supprimé");
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
    },
    // onError: () => toast.error("Erreur lors de la suppression du véhicule"),
  });

  return {
    list,
    listActive,
    listById,
    mgTable,
    create,
    update,
    updateMileage,
    softDelete,
    myVehicle,
  };
}
