import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListNotificationsParams, NotificationDTO, Paginated } from "../types/notifications";
import { NotificationAPI } from "../api/notification.api";
import { useModalStore } from "@/stores/modal-store";

// Keys stables
const keys = {
    all: ["notifications"] as const,
    list: (params: ListNotificationsParams) => [...keys.all, "list", params] as const,
    unreadCount: (scope?: string, includeGlobal?: boolean) =>
        [...keys.all, "unread-count", { scope, includeGlobal }] as const,
};

export const useNotification = (params?: ListNotificationsParams, opts?: { scope?: "user" | "role" | "all"; includeGlobal?: boolean }) => {

    const qc = useQueryClient();
    const { closeModal } = useModalStore()

    const list = useQuery<Paginated<NotificationDTO>>({
        queryKey: keys.list(params!),
        enabled: !!params,
        queryFn: () => NotificationAPI.list(params!),
        staleTime: 10_000
    })

    const unreadCount = useQuery<any>({
        queryKey: keys.unreadCount(opts?.scope, opts?.includeGlobal),
        queryFn: () => NotificationAPI.unreadCount(opts),
        staleTime: 5_000,
        // refetchInterval: 25_000
    })

    const markRead = useMutation({
        mutationFn: ({ id, read }: { id: string, read: boolean }) => NotificationAPI.markRead(id, read),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: keys.all });
            closeModal()
        }
    })

    const readAll = useMutation({
        mutationFn: (body?: { scope?: "user" | "role" | "all"; includeGlobal?: boolean }) => NotificationAPI.readAll(body),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: keys.all });
            closeModal()
        }
    })

    const softDelete = useMutation({
        mutationFn: ({ id }: { id: string }) => NotificationAPI.softDelete(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: keys.all });
            closeModal()
        }
    })

    return {
        list,
        unreadCount,
        markRead,
        readAll,
        softDelete
    }
}