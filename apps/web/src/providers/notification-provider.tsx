// src/providers/notification-provider.tsx
import { useRealtimeNotifications } from "@/modules/notifications/hooks/use-real-time-notification";
import { Toaster } from "sonner";

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useRealtimeNotifications(); // juste pour initialiser l’écoute

  return (
    <>
      <Toaster position="top-center" expand={false} richColors />
      {children}
    </>
  );
};
