import { SocketContext, SocketContextType } from "@/lib/socket-io";
import { useContext } from "react";

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
