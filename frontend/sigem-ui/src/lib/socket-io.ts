import { Socket } from "socket.io-client";
import { createContext } from "react";

export type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});
