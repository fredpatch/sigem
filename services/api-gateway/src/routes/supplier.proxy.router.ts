import "dotenv/config";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { createProxyMiddleware } from "http-proxy-middleware";
import { service } from "src/config/services";
import { forwardUserHeaders } from "src/middlewares/forward-user";

const SUPPLIER_PROXY = process.env.PROVIDER_SERVICE_URL;
const API_VERSION = "v1";
const router = Router();
const target = SUPPLIER_PROXY;

const supplierProxy = createProxyMiddleware({
  target: target,
  changeOrigin: true,
  pathRewrite: (_path, req) => (req as any).originalUrl || _path,
  on: {
    proxyReq: (proxyReq, req: any, _res) => {
      // Si on a un body déjà parsé (express.json)
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);

        // Assurer les bons headers
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

        // Écrire le body dans la requête proxifiée
        proxyReq.write(bodyData);
      }
    },

    proxyRes: (proxyRes, req, res) => {
      // Ici on peut intercepter la réponse si besoin
      // ✅ on supprime les CORS du service target (souvent '*')
      delete proxyRes.headers["access-control-allow-origin"];
      delete proxyRes.headers["access-control-allow-credentials"];
      delete proxyRes.headers["access-control-allow-headers"];
      delete proxyRes.headers["access-control-allow-methods"];

      // ✅ et on force ceux de la gateway
      const origin = req.headers.origin;
      if (origin) {
        proxyRes.headers["access-control-allow-origin"] = origin;
        proxyRes.headers["access-control-allow-credentials"] = "true";
        proxyRes.headers["vary"] = "Origin";
      }
    },
  },
});

// Supplier
router.use(
  `/${API_VERSION}/${service.PROVIDER_SERVICE.supplies}`, // ex: "/v1/supplies"
  authenticate,
  forwardUserHeaders,
  supplierProxy,
);

export { router as supplierProxyRouter };
