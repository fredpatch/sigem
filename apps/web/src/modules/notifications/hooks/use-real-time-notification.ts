// src/features/notifications/hooks/use-real-time-notification.ts
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { NOTIFICATIONS, SOCKET_EVENTS } from "@/constants";
import { useNotificationStore } from "../store/notification-store";
import { useSocket } from "./use-socket";

export type NotificationSeverity = "success" | "error" | "info" | "warning";

export interface SocketNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  severity: NotificationSeverity;
  createdAt: Date | string;
  relatedResource?: {
    resourceType: string;
    resourceId: string;
  };
  isRead: boolean;
  isDeleted: boolean;
  readAt?: Date | string;
  deletedAt?: Date | string;
}

export const useRealtimeNotifications = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleNotification = useCallback(
    (data: SocketNotification) => {
      // Normalisation date
      const normalized: SocketNotification = {
        ...data,
        createdAt: new Date(data.createdAt),
      };

      addNotification(
        normalized,
        undefined,
        undefined,
        normalized.type || "info"
      );

      // rafraîchir liste server-side (si tu as une page /notifications)
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS] });
    },
    [queryClient, addNotification]
  );

  useEffect(() => {
    if (!socket) return;

    // Notifications (ceux qui matchent ton notif-service)
    socket.on(SOCKET_EVENTS.NOTIFICATION_GLOBAL, handleNotification);
    socket.on(SOCKET_EVENTS.NOTIFICATION_USER, handleNotification);

    socket.on(SOCKET_EVENTS.NOTIFY_EVENT, handleNotification);

    // DIAG (ne pas router vers handleNotification)
    socket.on(SOCKET_EVENTS.DIAG_PONG, (payload) => {
      console.log("🏓 [SIGEM Socket] DIAG_PONG:", payload);
    });

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFY_EVENT, handleNotification);

      socket.off(SOCKET_EVENTS.NOTIFICATION_GLOBAL, handleNotification);
      socket.off(SOCKET_EVENTS.NOTIFICATION_USER, handleNotification);

      socket.off(SOCKET_EVENTS.DIAG_PONG, handleNotification);
    };
  }, [socket, handleNotification]);

  return !!socket;
};
