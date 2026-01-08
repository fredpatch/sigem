import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/stores/modal-store";
import { CategoryAPI } from "../api/category-api";

export function useCategory(id?: string) {
  const { closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationKey: ["categories"],
    mutationFn: async (data: unknown) => CategoryAPI.create(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal()
    },
  });

  const list = useQuery({
    queryKey: ["categories"],
    queryFn: (): Promise<any> => CategoryAPI.list(),
  });

  const listById = useQuery({
    queryKey: ["categories", id],
    enabled: !!id,
    queryFn: () => CategoryAPI.listById(id!),
  });

  const update = useMutation({
    mutationKey: ["categories", id],
    mutationFn: async (data: unknown) => CategoryAPI.update(data, id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const softDelete = useMutation({
    mutationKey: ["categories", id],
    mutationFn: async () => CategoryAPI.delete(id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return { create, list, listById, update, softDelete };
}
