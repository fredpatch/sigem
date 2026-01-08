import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    name: "SIGEM Notification Service",
    mongo: { connected: mongoose.connection.readyState === 1 },
    uptime: process.uptime(),
    ts: new Date().toISOString(),
    version: "v1",
  });
});
