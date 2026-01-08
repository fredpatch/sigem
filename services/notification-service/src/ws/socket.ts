// socket.ts
import { Server } from "socket.io";
import { createServer } from "http";
import type { Express } from "express";

export function createSocketServer(app: Express) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN || "*", credentials: true },
  });

  io.on("connection", (socket) => {
    // Option: rooms par user/role si tu as l’auth via cookies/JWT
    const userId = socket.handshake.auth?.userId as string | undefined;
    const role = socket.handshake.auth?.role as string | undefined;


    if (userId) socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);

  });

  return { httpServer, io };
}

// 2️⃣ Listen for diag pong from the client
// socket.on("ping", (payload: any) => {
//   console.log(
//     "🏓 [notif-service] DIAG_PONG from client:",
//     payload,
//     "socket=",
//     socket.id
//   );
// });
// log simple
// console.log("Socket connected", socket.id);