import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/stores/modal-store";
import { LocationAPI } from "../api/location-api";

export function useLocation(id?: string) {
  const { closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationKey: ["locations"],
    mutationFn: async (data: unknown) => LocationAPI.create(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      closeModal()
    },
  });

  const list = useQuery({
    queryKey: ["locations"],
    queryFn: (): Promise<any> => LocationAPI.list(),
  });

  const listById = useQuery({
    queryKey: ["locations", id],
    enabled: !!id,
    queryFn: () => LocationAPI.listById(id!),
  });

  const update = useMutation({
    mutationKey: ["locations", id],
    mutationFn: async (data: unknown) => LocationAPI.update(data, id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const softDelete = useMutation({
    mutationKey: ["locations", id],
    mutationFn: async () => LocationAPI.delete(id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  return { create, list, listById, update, softDelete };
}
