import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/stores/modal-store";
import { AssetAPI } from "../api/asset-api";
import { AssetUpdateInput } from "../schema/schema";

export function useAsset(id?: string, includeDeleted?: boolean) {
  const { closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationKey: ["assets-create"],
    mutationFn: async (data: any) => AssetAPI.create(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      closeModal();
    },
  });

  const list = useQuery({
    queryKey: ["assets", { includeDeleted }],
    queryFn: (): Promise<any> => AssetAPI.list(includeDeleted),
  });

  const listById = useQuery({
    queryKey: ["assets", id],
    enabled: !!id,
    queryFn: () => AssetAPI.listById(id!),
  });

  const update = useMutation({
    mutationKey: ["assets-update", id],
    mutationFn: async (data: AssetUpdateInput) => AssetAPI.update(id!, data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      closeModal();
    },
  });

  const softDelete = useMutation({
    mutationKey: ["assets-delete", id],
    mutationFn: async () => AssetAPI.delete(id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  return { create, list, listById, update, softDelete };
}
