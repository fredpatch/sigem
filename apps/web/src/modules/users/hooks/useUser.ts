import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAPI } from "../api/user-api";
import { useModalStore } from "@/stores/modal-store";

export function useUser(id?: string) {
  const { closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["users"],
    queryFn: UserAPI.list,
  });

  const listById = useQuery({
    queryKey: ["users", id],
    enabled: !!id,
    queryFn: () => UserAPI.listById(id!),
  });

  const update = useMutation({
    mutationKey: ["users", id],
    mutationFn: async (data: unknown) => UserAPI.update(data, id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const reset = useMutation({
    mutationKey: ["users", id],
    mutationFn: async (request: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) =>
      UserAPI.reset(
        id!,
        request.currentPassword,
        request.newPassword,
        request.confirmPassword
      ),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deactivate = useMutation({
    mutationKey: ["users", id],
    mutationFn: async () => UserAPI.deactivate(id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const softDelete = useMutation({
    mutationKey: ["users", id],
    mutationFn: async () => UserAPI.delete(id!),
    onSuccess() {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return { list, listById, update, deactivate, softDelete, reset };
}
