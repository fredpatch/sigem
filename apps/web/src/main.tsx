import "@/styles/index.css";
import App from "./App";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { queryClient } from "./lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "./modules/auth/store/use-auth.store";
import { SocketProvider } from "./providers/socket-provider";
import { NotificationProvider } from "./providers/notification-provider";

// Preload current user session before app renders (optional but good)
useAuthStore.getState().fetchMe();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <NotificationProvider>
          <App />
          <ReactQueryDevtools position="bottom" initialIsOpen={false} />
        </NotificationProvider>
      </SocketProvider>
    </QueryClientProvider>
  </StrictMode>,
);
