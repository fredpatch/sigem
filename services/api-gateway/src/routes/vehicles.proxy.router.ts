import "dotenv/config";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { createProxyMiddleware } from "http-proxy-middleware";
import { service } from "src/config/services";
import { forwardUserHeaders } from "src/middlewares/forward-user";

const VEHICLE_PROXY = process.env.VEHICLE_SERVICE_URL;
const API_VERSION = "v1";
const router = Router();
const target = VEHICLE_PROXY;

const vehicleProxy = createProxyMiddleware({
  target: target,
  changeOrigin: true,
  pathRewrite: (_path, req) => {
    /**
     * La clé: on réutilise req.originalUrl
     * - Requête côté gateway:  /v1/vehicles
     * - originalUrl = "/v1/vehicles"
     * - On renvoie ça côté vehicle-service
     */
    const original = (req as any).originalUrl || _path;
    return original;
  },
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
    }
  },
});

// Vehicles
router.use(
  `/${API_VERSION}/${service.VEHICLE_SERVICE.vehicles}`, // ex: "/v1/vehicles"
  authenticate,
  forwardUserHeaders,
  vehicleProxy
);

// Documents
router.use(
  `/${API_VERSION}/${service.VEHICLE_SERVICE.documents}`, // ex: "/v1/vehicle-documents"
  authenticate,
  forwardUserHeaders,
  vehicleProxy
);

// Vehicle task templates
router.use(
  `/${API_VERSION}/${service.VEHICLE_SERVICE.taskTemplates}`, // ex: "/v1/vehicle-task-templates"
  authenticate,
  forwardUserHeaders,
  vehicleProxy
);

// Vehicle tasks
router.use(
  `/${API_VERSION}/${service.VEHICLE_SERVICE.tasks}`, // ex: "/v1/vehicle-tasks"
  authenticate,
  forwardUserHeaders,
  vehicleProxy
);

export { router as vehicleProxyRouter };
