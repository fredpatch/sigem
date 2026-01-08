// src/routes/health.router.ts
import { Router } from "express";
import mongoose from "mongoose";
import { env } from "src/config/env";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  res.json({
    service: env.SERVICE_NAME,
    status: "ok",
    uptime: process.uptime(),
    db: dbState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});
