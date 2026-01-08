import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateVehicleDocumentDto,
  UpdateVehicleDocumentDto,
  vehicleDocumentsAPI,
} from "../api/vehicle-document.api";
import { useModalStore } from "@/stores/modal-store";

export function useVehicleDocuments(vehicleId?: string) {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  const list = useQuery({
    queryKey: ["vehicle-documents", vehicleId],
    queryFn: () => vehicleDocumentsAPI.list(vehicleId!),
    enabled: !!vehicleId,
  });

  const create = useMutation({
    mutationKey: ["vehicle-documents", "create"],
    mutationFn: (payload: CreateVehicleDocumentDto) =>
      vehicleDocumentsAPI.create(payload),
    onSuccess: (_doc, payload) => {
      // Rafraîchir la liste des docs du véhicule
      queryClient.invalidateQueries({
        queryKey: ["vehicle-documents", payload.vehicleId],
      });

      // Rafraîchir la page monitoring globale
      queryClient.invalidateQueries({
        queryKey: ["vehicle-documents-monitoring"],
      });

      closeModal();
    },
  });

  const update = useMutation({
    mutationKey: ["vehicle-documents", "update"],
    mutationFn: (args: { id: string; payload: UpdateVehicleDocumentDto }) =>
      vehicleDocumentsAPI.update(args.id, args.payload),
    onSuccess: (doc) => {
      // doc.vehicleId peut être une string ou un objet { id, ... }
      const vehicleKey =
        typeof doc.vehicleId === "string" ? doc.vehicleId : doc.vehicleId.id;

      if (vehicleKey) {
        queryClient.invalidateQueries({
          queryKey: ["vehicle-documents", vehicleKey],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["vehicle-documents-monitoring"],
      });
      closeModal();
    },
  });

  const remove = useMutation({
    mutationKey: ["vehicle-documents", "delete"],
    mutationFn: (id: string) => vehicleDocumentsAPI.remove(id),
    onSuccess: (_res) => {
      // si besoin tu peux passer vehicleId en param aussi
      queryClient.invalidateQueries({ queryKey: ["vehicle-documents"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-documents-monitoring"],
      });
      closeModal();
    },
  });

  return {
    list,
    create,
    update,
    remove,
  };
}

export function useVehicleDocumentsMonitoring() {
  return useQuery({
    queryKey: ["vehicle-documents-monitoring"],
    queryFn: () => vehicleDocumentsAPI.listAll(), // à créer ci-dessous
  });
}
