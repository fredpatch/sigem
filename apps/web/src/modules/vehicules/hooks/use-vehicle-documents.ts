import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleDocumentsAPI } from "../api/vehicle-document.api";
import { useModalStore } from "@/stores/modal-store";
import { UpsertVehicleDocumentPayload } from "../types/vehicle-document.types";

export const vehicleDocKeys = {
  byVehicle: (vehicleId: string) => ["vehicle-documents", vehicleId] as const,
};

export function useVehicleDocuments(vehicleId?: string) {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  const list = useQuery({
    queryKey: ["vehicle-documents", vehicleId],
    queryFn: () => vehicleDocumentsAPI.list(vehicleId!),
    enabled: !!vehicleId,
  });

  const byVehicle = useQuery({
    queryKey: ["vehicle-documents-by-vehicle", vehicleId],
    queryFn: () => vehicleDocumentsAPI.listByVehicle(vehicleId!),
    enabled: !!vehicleId,
  });

  const create = useMutation({
    mutationKey: ["vehicle-documents", "create"],
    mutationFn: (payload: Omit<UpsertVehicleDocumentPayload, "vehicleId">) =>
      vehicleDocumentsAPI.create(vehicleId!, payload),
    onSuccess: (_doc) => {
      // Rafraîchir la liste des docs du véhicule
      queryClient.invalidateQueries({
        queryKey: ["vehicle-documents", vehicleId],
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
    mutationFn: (args: {
      docId: string;
      payload: Omit<UpsertVehicleDocumentPayload, "vehicleId">;
    }) => vehicleDocumentsAPI.update(args.docId, args.payload),
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

  const upsert = useMutation({
    mutationFn: async (payload: UpsertVehicleDocumentPayload) => {
      const docs = await vehicleDocumentsAPI.listByVehicle(payload.vehicleId);
      const existing = (docs || []).find((d: any) => d.type === payload.type);

      const body = {
        type: payload.type,
        reference: payload.reference,
        issuedAt: payload.issuedAt,
        expiresAt: payload.expiresAt,
        reminderDaysBefore: payload.reminderDaysBefore ?? [30, 15, 7],
        provider: payload.provider,
      };

      if (existing?.id) return vehicleDocumentsAPI.update(existing.id, body);
      return vehicleDocumentsAPI.create(payload.vehicleId, body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: vehicleDocKeys.byVehicle(vars.vehicleId),
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }); // si ta table dépend d’un endpoint agrégé
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
    byVehicle,
    upsert,
  };
}

export function useVehicleDocumentsMonitoring() {
  return useQuery({
    queryKey: ["vehicle-documents-monitoring"],
    queryFn: () => vehicleDocumentsAPI.listAll(), // à créer ci-dessous
  });
}
