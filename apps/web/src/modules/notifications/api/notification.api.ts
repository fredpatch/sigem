import { api } from "@/lib/axios";
import { ListNotificationsParams, NotificationDTO, NotificationScope, Paginated } from "../types/notifications";
import { toQuery } from "../helpers/notification.helper";


export class NotificationAPI {
    static async list(params: ListNotificationsParams) {
        const res = await api.get<Paginated<NotificationDTO>>(`/notifications${toQuery(params as any)}`);

        // console.log("NotificationAPI.list response data:", res);

        return res.data;
        // return data;
    }

    static async unreadCount(params?: { scope?: NotificationScope, includeGlobal?: boolean }) {
        const response = await api.get<any>(`/notifications/unread-count${toQuery(params as any)}`);

        // console.log(response);
        return response;
    }

    static async markRead(id: string, read: boolean) {
        const response = await api.patch<{ item: NotificationDTO }>(`/notifications/${id}/read`, { read });

        // console.log(response);
        return response.data;
    }

    static async readAll(body?: { scope?: NotificationScope, includeGlobal?: boolean }) {
        const response = await api.patch<{ modified: number }>(`/notifications/read-all`, body ?? {});

        return response.data;
    }

    static async softDelete(id: string) {
        await api.patch<any>(`/notifications/${id}`);
    }
}
