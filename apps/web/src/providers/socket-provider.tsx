import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { SOCKET_IO } from "@/constants";
import { useNotificationStore } from "@/modules/notifications/store/notification-store";
import { SocketContext, SocketContextType } from "@/lib/socket-io";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<SocketContextType["socket"]>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const user = useAuthStore((state) => state.user);

  // console.log("🚀 ~ file: socket.tsx:13 ~ SocketProvider ~ user:", user);

  useEffect(() => {
    if (!user?._id) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    // si déjà connecté pour ce user, ne recrée pas
    if (socketRef.current) return;

    const s = io(SOCKET_IO, {
      transports: ["websocket"],
      withCredentials: true,

      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000, // Time between attempts

      auth: {
        userId: user?._id,
        role: user?.role,
      },
    });

    socketRef.current = s;

    s.on("connect", () => {
      setIsConnected(true);
      console.log("🟣 [SIGEM Socket] Connected to socket:", s.id);
    });

    // socketInstance.on("sigem.diag.ping", (timestamp) => {
    //   const delay = Date.now() - timestamp;
    //   console.log(`Socket latency: ${timestamp} ms`);
    // });

    // socketInstance.on("sigem.diag.pong", (msg) => {
    //   console.log("🎯 [SIGEM Socket] Pong received:", msg);
    // });

    // 🟣 DIAG: listen for server ping & send pong back
    // socketInstance.on(SOCKET_EVENTS.DIAG_PING, (payload) => {
    //   console.log("🟣 [SIGEM Socket] DIAG_PING from server:", payload);
    //   socketInstance.emit(SOCKET_EVENTS.DIAG_PONG, {
    //     ts: Date.now(),
    //     echo: payload,
    //   });
    //   console.log("🏓 [SIGEM Socket] DIAG_PONG sent back");
    // });

    s.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("🔌 [SIGEM Socket] Disconnected from server:", reason);
    });

    s.on("connect_error", (error) => {
      // console.log(error);
      console.error("❌ [SIGEM Socket] Connect error::", error.message);
      addNotification(null, "❌ Socket", error.message, "error");
    });

    setSocket(s);
    return () => {
      s.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
