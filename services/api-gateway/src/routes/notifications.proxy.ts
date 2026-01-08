import {
  Router,
  type Request,
  type Response,
  type RequestHandler,
} from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authenticate } from "../middlewares/authenticate";

const NOTIF_SERVICE_URL =
  process.env.NOTIF_SERVICE_URL || "http://localhost:4001";

export const router = Router();

// /v1/notifications/*  →  NOTIF_SERVICE_URL + (chemin réécrit sans le prefix)
const proxyMw: RequestHandler = createProxyMiddleware({
  target: NOTIF_SERVICE_URL,
  changeOrigin: true,

  // v3: pathRewrite est une fonction (plus fiable que l’ancien objet)
  pathRewrite: (path /*, req */) => path.replace(/^\/v1\/notifications/, ""),

  // v3: les hooks d’événements sont sous `on`
  on: {
    proxyReq: (proxyReq, req: Request, _res: Response) => {
      const u = req.user;
      if (u) {
        proxyReq.setHeader("x-user-id", u.id);
        proxyReq.setHeader("x-user-role", u.role);
        proxyReq.setHeader("x-user-username", u.username!);
        proxyReq.setHeader("x-user-sessionId", u.sessionId);
        proxyReq.setHeader("x-user-matriculation", u.matriculation!);
      }
    },
  },
});

router.use("/", authenticate, proxyMw);
