// src/features/notifications/store.ts
import { create } from "zustand";
import { toast } from "sonner";
import {
  NotificationSeverity,
  SocketNotification,
} from "../hooks/use-real-time-notification";

interface NotificationState {
  items: SocketNotification[];
  addNotification: (
    notification: SocketNotification | null,
    title?: string,
    message?: string,
    type?: string,
    severity?: NotificationSeverity
  ) => void;

  upsertMany: (items: SocketNotification[]) => void; // ✅ NEW
  softDelete: (id: string) => void; // ✅ NEW (optionnel)

  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  items: [],

  addNotification: (
    notification,
    overrideTitle,
    overrideMessage,
    overrideType,
    overrideSeverity
  ) => {
    const n: SocketNotification = notification ?? {
      id: crypto.randomUUID(),
      title: overrideTitle ?? "Notification",
      message: overrideMessage ?? "",
      type: overrideType ?? "notify.event",
      severity: overrideSeverity ?? "info",
      createdAt: new Date(),
      relatedResource: undefined,
      isRead: false,
      isDeleted: false,
    };

    // 1️⃣ Enregistrer dans le store
    set((state) => ({
      items: [n, ...state.items],
    }));

    // 2️⃣ Afficher via Sonner
    const severity = overrideSeverity ?? n.severity ?? "info";

    switch (severity) {
      case "success":
        toast.success(n.title, { description: n.message });
        break;
      case "error":
        toast.error(n.title, { description: n.message });
        break;
      case "warning":
        toast.warning(n.title, { description: n.message });
        break;
      default:
        toast(n.title, { description: n.message });
        break;
    }
  },

  upsertMany: (incoming) =>
    set((state) => {
      const byId = new Map<string, SocketNotification>();

      // 1) existants
      for (const n of state.items) byId.set(n.id, n);

      // 2) incoming (API) overwrite proprement
      for (const raw of incoming) {
        const n: SocketNotification = {
          ...raw,
          createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
          readAt: raw.readAt ? new Date(raw.readAt) : raw.readAt,
        };

        const prev = byId.get(n.id);

        // merge: incoming prend priorité, mais on garde certains champs locaux si manquants
        byId.set(n.id, { ...prev, ...n });
      }

      // 3) tri desc
      const merged = Array.from(byId.values()).sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      );

      return { items: merged };
    }),

  softDelete: (id) =>
    set((state) => ({
      items: state.items.map((n) =>
        n.id === id ? { ...n, isDeleted: true, deletedAt: new Date() } : n
      ),
    })),


  markAsRead: (id) =>
    set((state) => ({
      items: state.items.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
      ),
    })),

  clearAll: () => set({ items: [] }),
}));
