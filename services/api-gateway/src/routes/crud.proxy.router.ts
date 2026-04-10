import "dotenv/config";
import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const POC_SERVICE_URL = process.env.POC_SERVICE_URL;
const API_VERSION = "v1";
const router = Router();

if (!POC_SERVICE_URL) {
  console.warn(
    "[proxy] POC_SERVICE_URL is not defined, skipping legacy CRUD proxy routes",
  );
} else {
  const crudProxy = createProxyMiddleware({
    target: POC_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => {
      const original = (req as any).originalUrl || _path;
      return original;
    },
    on: {
      proxyReq: (proxyReq, req: any, _res) => {
        if (req.body && Object.keys(req.body).length) {
          const bodyData = JSON.stringify(req.body);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      proxyRes: (proxyRes, req, _res) => {
        delete proxyRes.headers["access-control-allow-origin"];
        delete proxyRes.headers["access-control-allow-credentials"];
        delete proxyRes.headers["access-control-allow-headers"];
        delete proxyRes.headers["access-control-allow-methods"];

        const origin = req.headers.origin;
        if (origin) {
          proxyRes.headers["access-control-allow-origin"] = origin;
          proxyRes.headers["access-control-allow-credentials"] = "true";
          proxyRes.headers["vary"] = "Origin";
        }
      },
    },
  });

  router.use(`/${API_VERSION}/api/contacts`, crudProxy);
}

export { router as crudProxyRouter };
